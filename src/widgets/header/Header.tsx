"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth, useAuthGate } from "@/features/auth";
import { getListings } from "@/shared/api/listings";
import { requestHomeTitleSearch } from "@/shared/lib/home-title-search";

import { Avatar } from "./Avatar";
import { ButtonPrimary } from "./ButtonPrimary";
import { HeaderCategoriesDropdown } from "./HeaderCategoriesDropdown";
import { HeaderDropdown } from "./HeaderDropdown";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LoginButton } from "./LoginButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { BellIcon, HeartIcon, SearchIcon } from "@/shared/ui/icons";

type OpenPanel = "notifications" | "profile" | null;

type SearchSuggestion = {
  id: string;
  title: string;
};

const HEADER_CATEGORIES_LEFT = 166;
const HEADER_ACTIONS_LEFT = 1049;
/** Same gap as between expanded search and «Разместить предложение». */
const HEADER_SEARCH_SIDE_GAP = 8;
const HEADER_CATEGORIES_WIDTH_FALLBACK = 178;

function getPageScrollTop() {
  return Math.max(
    window.pageYOffset,
    document.documentElement.scrollTop,
    document.body.scrollTop,
    document.scrollingElement?.scrollTop ?? 0,
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { isAuthenticated, user } = useAuth();
  const { guardAuth } = useAuthGate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCloseTimerRef = useRef<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeSearchSuggestionIndex, setActiveSearchSuggestionIndex] = useState<number>(-1);
  const [categoriesWidth, setCategoriesWidth] = useState(HEADER_CATEGORIES_WIDTH_FALLBACK);

  const handleCategoriesWidthChange = useCallback((width: number) => {
    setCategoriesWidth(width > 0 ? width : HEADER_CATEGORIES_WIDTH_FALLBACK);
  }, []);

  const expandedSearchBox = useMemo(() => {
    const left = HEADER_CATEGORIES_LEFT + categoriesWidth + HEADER_SEARCH_SIDE_GAP;
    const width = Math.max(
      200,
      HEADER_ACTIONS_LEFT - HEADER_SEARCH_SIDE_GAP - left,
    );
    return { left, width };
  }, [categoriesWidth]);

  /** Expanded search: on scroll always, or after clicking the search icon at top. */
  const showExpandedSearch = isScrolled || isSearchExpanded || isSearchClosing;
  const logoTone = !isHomePage && !isScrolled ? "dark" : "brand";

  const handleCreateListing = useCallback(() => {
    guardAuth("create-listing", () => router.push("/create-listing"));
  }, [guardAuth, router]);

  const togglePanel = useCallback((panel: Exclude<OpenPanel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setOpenPanel(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isSearchExpanded || isScrolled) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        closeSearchWithAnimation();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearchWithAnimation();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchExpanded, isScrolled]);

  useEffect(() => {
    if (!showExpandedSearch || searchSuggestions.length === 0) {
      setActiveSearchSuggestionIndex(-1);
      return;
    }

    setActiveSearchSuggestionIndex((current) => {
      if (current >= 0 && current < searchSuggestions.length) return current;
      return -1;
    });
  }, [showExpandedSearch, searchSuggestions]);

  useEffect(() => {
    return () => {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showExpandedSearch || isSearchClosing) {
      setSearchSuggestions([]);
      setIsSearchLoading(false);
      return;
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setSearchSuggestions([]);
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearchLoading(true);
      void getListings({ page: 1, pageSize: 10, query: trimmedQuery }, controller.signal)
        .then((response) => {
          const seenTitles = new Set<string>();
          const suggestions: SearchSuggestion[] = [];

          for (const listing of response.data) {
            const title = listing.title.trim();
            if (!title || seenTitles.has(title.toLowerCase())) continue;
            seenTitles.add(title.toLowerCase());
            suggestions.push({ id: listing.id, title });
            if (suggestions.length >= 8) break;
          }

          setSearchSuggestions(suggestions);
        })
        .catch((error: unknown) => {
          if (
            typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name?: string }).name === "AbortError"
          ) {
            return;
          }
          setSearchSuggestions([]);
        })
        .finally(() => {
          setIsSearchLoading(false);
        });
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [showExpandedSearch, isSearchClosing, searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const updateFromScroll = () => {
      setIsScrolled(getPageScrollTop() > 1);
    };

    let rafId = 0;
    const scheduleScrollUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateFromScroll();
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting || getPageScrollTop() > 1);
      },
      { threshold: [0, 1], rootMargin: "0px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    updateFromScroll();

    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    document.addEventListener("scroll", scheduleScrollUpdate, { passive: true, capture: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleScrollUpdate);
      document.removeEventListener("scroll", scheduleScrollUpdate, true);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, []);

  // On scroll: open search immediately. Back at top: collapse unless manually kept open.
  useEffect(() => {
    if (isScrolled) {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
        searchCloseTimerRef.current = null;
      }
      setIsSearchClosing(false);
      setIsSearchExpanded(true);
      return;
    }

    // Returned to top — collapse to icon state.
    if (isSearchExpanded) {
      closeSearchWithAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolled]);

  const closeSearchWithAnimation = (options?: { clear?: boolean }) => {
    if (searchCloseTimerRef.current !== null) {
      window.clearTimeout(searchCloseTimerRef.current);
    }

    if (options?.clear) {
      setSearchQuery("");
      setSearchSuggestions([]);
    }

    setIsSearchClosing(true);
    setIsSearchExpanded(false);
    setActiveSearchSuggestionIndex(-1);
    searchInputRef.current?.blur();
    searchCloseTimerRef.current = window.setTimeout(() => {
      setIsSearchClosing(false);
      searchCloseTimerRef.current = null;
    }, 300);
  };

  const applyHomeFeedSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    requestHomeTitleSearch(trimmed);
    if (pathname !== "/") {
      router.push("/");
    }
    if (!isScrolled) {
      closeSearchWithAnimation();
    } else {
      setSearchQuery("");
      setSearchSuggestions([]);
      setActiveSearchSuggestionIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchToggle = () => {
    if (!showExpandedSearch || isSearchClosing) {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
        searchCloseTimerRef.current = null;
      }
      setIsSearchClosing(false);
      setIsSearchExpanded(true);
      setActiveSearchSuggestionIndex(-1);
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      });
      return;
    }

    if (searchQuery.trim()) {
      applyHomeFeedSearch(searchQuery);
      return;
    }

    if (!isScrolled) {
      closeSearchWithAnimation();
    }
  };

  const handleSearchClose = () => {
    if (isScrolled) {
      setSearchQuery("");
      setSearchSuggestions([]);
      setActiveSearchSuggestionIndex(-1);
      return;
    }
    closeSearchWithAnimation({ clear: true });
  };

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-1 w-full shrink-0" aria-hidden="true" />
      <header
        className="site-header fixed inset-x-0 top-0 z-50 h-[54px]"
        data-scrolled={isScrolled ? "true" : undefined}
        data-home={isHomePage ? "true" : undefined}
      >
        <div className="site-header__backdrop" aria-hidden="true" />
        <div className="site-header__inner relative mx-auto h-full w-full max-w-[1440px]">
          <div className="absolute left-[3px] top-[5px] flex h-[41px] w-[101px] items-start">
            <Logo tone={logoTone} />
          </div>

          <HeaderCategoriesDropdown onTriggerWidthChange={handleCategoriesWidthChange} />

          <div
            ref={searchRef}
            className={`absolute top-[11px] z-[50] h-[32px] transition-[left,width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
              showExpandedSearch && !isSearchClosing ? "" : "left-[1007px] w-[32px]"
            }`}
            style={
              showExpandedSearch && !isSearchClosing
                ? { left: expandedSearchBox.left, width: expandedSearchBox.width }
                : undefined
            }
          >
            <div className="h-full w-full overflow-hidden">
              {showExpandedSearch ? (
                <div
                  className={`site-header-search flex h-full w-full items-center gap-[9px] rounded-[36px] border-[0.5px] border-solid px-[8px] transition-[border-color,background-color,color] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                    isSearchClosing
                      ? "border-[#8E8BED] bg-white text-[#1A1A1A]"
                      : "site-header-search-field border-[#CACACA]"
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Поиск"
                    onClick={handleSearchToggle}
                    className="flex h-[16px] w-[16px] shrink-0 items-center justify-center outline-none focus:outline-none focus-visible:outline-none"
                  >
                    <SearchIcon className="h-[16px] w-[16px]" />
                  </button>
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setActiveSearchSuggestionIndex(-1);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        if (searchSuggestions.length === 0) return;
                        event.preventDefault();
                        setActiveSearchSuggestionIndex((current) =>
                          current < 0 ? 0 : (current + 1) % searchSuggestions.length,
                        );
                        return;
                      }

                      if (event.key === "ArrowUp") {
                        if (searchSuggestions.length === 0) return;
                        event.preventDefault();
                        setActiveSearchSuggestionIndex((current) =>
                          current < 0
                            ? searchSuggestions.length - 1
                            : (current - 1 + searchSuggestions.length) % searchSuggestions.length,
                        );
                        return;
                      }

                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (
                          activeSearchSuggestionIndex >= 0 &&
                          activeSearchSuggestionIndex < searchSuggestions.length
                        ) {
                          const picked = searchSuggestions[activeSearchSuggestionIndex];
                          setSearchQuery(picked.title);
                          applyHomeFeedSearch(picked.title);
                          return;
                        }

                        if (searchQuery.trim()) {
                          applyHomeFeedSearch(searchQuery);
                        }
                      }
                    }}
                    placeholder=""
                    aria-label="Поиск по объявлениям"
                    tabIndex={isSearchClosing ? -1 : 0}
                    className={
                      isSearchClosing
                        ? "pointer-events-none absolute h-0 w-0 opacity-0"
                        : "h-[16px] min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-none text-[#1A1A1A] outline-none ring-0 placeholder:text-[#1A1A1A]/60 focus:outline-none focus:ring-0 focus-visible:outline-none"
                    }
                  />
                  <button
                    type="button"
                    aria-label="Закрыть поиск"
                    onClick={handleSearchClose}
                    tabIndex={isSearchClosing ? -1 : 0}
                    className={
                      isSearchClosing
                        ? "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                        : "ml-auto flex h-[16px] w-[16px] shrink-0 items-center justify-center text-[#1A1A1A] outline-none transition hover:opacity-70 focus:outline-none focus-visible:outline-none"
                    }
                  >
                    <svg
                      viewBox="0 0 12 12"
                      width="12"
                      height="12"
                      fill="none"
                      aria-hidden
                      className="block h-[12px] w-[12px]"
                    >
                      <path
                        d="M1 1L11 11M11 1L1 11"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Поиск"
                  onClick={handleSearchToggle}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[13px] border-[0.5px] border-solid border-[#8E8BED] bg-white text-[#1A1A1A] transition-colors hover:bg-[#fafaff]"
                >
                  <SearchIcon className="h-[16px] w-[16px]" />
                </button>
              )}
            </div>

            {showExpandedSearch &&
            !isSearchClosing &&
            (isSearchLoading || searchQuery.trim().length >= 2) ? (
              <div className="site-header-search site-header-search-dropdown absolute left-0 top-[36px] z-[70] w-full overflow-hidden rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
                {isSearchLoading ? (
                  <p className="px-[12px] py-[10px] text-[14px] text-[#3D3D3D]">Ищем...</p>
                ) : searchSuggestions.length > 0 ? (
                  <ul className="max-h-[260px] overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSearchSuggestionIndex(index)}
                          onClick={() => {
                            setSearchQuery(suggestion.title);
                            applyHomeFeedSearch(suggestion.title);
                          }}
                          className={`block w-full px-[12px] py-[10px] text-left text-[14px] text-[#3D3D3D] outline-none transition hover:bg-[#1A1A1A]/6 focus:outline-none focus-visible:outline-none ${
                            index === activeSearchSuggestionIndex ? "bg-[#1A1A1A]/6" : ""
                          }`}
                        >
                          {suggestion.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.trim().length >= 2 ? (
                  <p className="px-[12px] py-[10px] text-[14px] text-[#3D3D3D]">Ничего не найдено</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="absolute left-[1049px] top-[11px] flex h-[32px] items-center justify-end gap-[16px]">
            <ButtonPrimary className="w-[243px]" onClick={handleCreateListing}>
              Разместить предложение
            </ButtonPrimary>

            {isAuthenticated && user ? (
              <>
                <HeaderDropdown
                  open={openPanel === "notifications"}
                  onOpenChange={(open) => setOpenPanel(open ? "notifications" : null)}
                  panelLabel="Уведомления"
                  trigger={
                    <IconButton
                      label="Уведомления"
                      aria-expanded={openPanel === "notifications"}
                      aria-haspopup="dialog"
                      onClick={() => togglePanel("notifications")}
                    >
                      <BellIcon className="h-[15px] w-[14px] text-black" />
                    </IconButton>
                  }
                >
                  <NotificationsDropdown />
                </HeaderDropdown>

                <IconButton label="Избранное" onClick={() => router.push("/favorites")}>
                  <HeartIcon className="h-[14px] w-[16px] text-black" />
                </IconButton>

                <HeaderDropdown
                  open={openPanel === "profile"}
                  onOpenChange={(open) => setOpenPanel(open ? "profile" : null)}
                  panelLabel="Профиль"
                  trigger={
                    <Avatar
                      initial={user.avatarInitial}
                      src={user.avatarUrl}
                      aria-expanded={openPanel === "profile"}
                      aria-haspopup="dialog"
                      onClick={() => togglePanel("profile")}
                    />
                  }
                >
                  <ProfileDropdown onClose={() => setOpenPanel(null)} />
                </HeaderDropdown>
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </header>
    </>
  );
}
