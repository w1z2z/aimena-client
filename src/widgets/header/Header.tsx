"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { useAuth, useAuthGate } from "@/features/auth";
import { useChatInbox } from "@/features/chat-inbox";
import { getListings } from "@/shared/api/listings";
import { requestHomeTitleSearch } from "@/shared/lib/home-title-search";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";
import { BellIcon, BurgerIcon, HeartIcon, SearchIcon } from "@/shared/ui/icons";

import { Avatar } from "./Avatar";
import { ButtonPrimary } from "./ButtonPrimary";
import {
  COMPACT_HEADER_QUERY,
  OVERLAY_ANIMATION_MS,
} from "./constants";
import { HeaderCategoriesDropdown } from "./HeaderCategoriesDropdown";
import { HeaderDropdown } from "./HeaderDropdown";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LoginButton } from "./LoginButton";
import { MobileBottomNav } from "./MobileBottomNav";
import { ProfileDropdown } from "./ProfileDropdown";

type OpenPanel = "notifications" | "profile" | null;

type SearchSuggestion = {
  id: string;
  title: string;
};

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
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
  const { isAuthenticated, user } = useAuth();
  const { hasUnreadNotifications } = useChatInbox();
  const { guardAuth } = useAuthGate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCloseTimerRef = useRef<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeSearchSuggestionIndex, setActiveSearchSuggestionIndex] = useState<number>(-1);
  const [compactMode, setCompactMode] = useState(isCompact);

  // Reset before paint when crossing into compact — avoids a one-frame open + close animation flash.
  if (isCompact !== compactMode) {
    setCompactMode(isCompact);
    if (isCompact) {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
        searchCloseTimerRef.current = null;
      }
      setIsSearchExpanded(false);
      setIsSearchClosing(false);
      setSearchQuery("");
      setSearchSuggestions([]);
      setActiveSearchSuggestionIndex(-1);
    } else {
      setIsMobileMenuOpen(false);
    }
  }

  const { isRendered: compactSearchRendered, isVisible: compactSearchVisible } = useOverlayPresence(
    isCompact && isSearchExpanded,
  );
  useScrollLock(
    isCompact && (isSearchExpanded || compactSearchRendered),
    searchResultsRef,
  );

  /** Desktop: expanded on scroll, or after clicking the search icon at top. Compact: overlay presence. */
  const showExpandedSearch =
    (!isCompact && (isScrolled || isSearchExpanded || isSearchClosing)) ||
    (isCompact && (isSearchExpanded || isSearchClosing || compactSearchRendered));
  const mountCompactSearch =
    isCompact && (isSearchExpanded || isSearchClosing || compactSearchRendered);
  const showSearchSuggestions =
    showExpandedSearch &&
    !isSearchClosing &&
    (isSearchLoading || searchQuery.trim().length >= 2);
  const { isRendered: suggestionsRendered, isVisible: suggestionsVisible } =
    useOverlayPresence(Boolean(showSearchSuggestions));
  const logoTone = !isHomePage && !isScrolled ? "dark" : "brand";
  const desktopSearchExpanded = !isCompact && showExpandedSearch && !isSearchClosing;

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
    if (!isSearchExpanded || (!isCompact && isScrolled)) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current?.contains(target) || searchToggleRef.current?.contains(target)) {
        return;
      }
      closeSearchWithAnimation();
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
  }, [isSearchExpanded, isScrolled, isCompact]);

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

  // Desktop only: search bar follows scroll; do not mirror into isSearchExpanded
  // (that flag is for manual open and must not open the compact overlay on resize).
  useEffect(() => {
    if (isCompact) return;

    if (isScrolled) {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
        searchCloseTimerRef.current = null;
      }
      setIsSearchClosing(false);
      return;
    }

    if (isSearchExpanded) {
      closeSearchWithAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolled, isCompact]);

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
    }, OVERLAY_ANIMATION_MS);
  };

  const applyHomeFeedSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isCompact) {
      // Unlock/close first — scroll-lock cleanup restores scrollY and would
      // undo scrollIntoView if we search while the overlay is still locking.
      closeSearchWithAnimation({ clear: true });
      window.setTimeout(() => {
        requestHomeTitleSearch(trimmed);
        if (pathname !== "/") {
          router.push("/");
        }
      }, OVERLAY_ANIMATION_MS + 32);
      return;
    }

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
      // flushSync: mount input in this tap so iOS allows the keyboard.
      flushSync(() => {
        setIsSearchClosing(false);
        setIsSearchExpanded(true);
        setIsMobileMenuOpen(false);
        setOpenPanel(null);
        setActiveSearchSuggestionIndex(-1);
      });
      searchInputRef.current?.focus();
      return;
    }

    if (searchQuery.trim()) {
      applyHomeFeedSearch(searchQuery);
      return;
    }

    if (isCompact || !isScrolled) {
      closeSearchWithAnimation();
    }
  };

  const handleSearchClose = () => {
    if (!isCompact && isScrolled) {
      setSearchQuery("");
      setSearchSuggestions([]);
      setActiveSearchSuggestionIndex(-1);
      return;
    }
    closeSearchWithAnimation({ clear: true });
  };

  const handleSearchInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
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
  };

  const searchField = (
    <div
      className={`site-header-search flex h-full w-full items-center gap-[9px] rounded-[31px] border-[0.3px] border-solid px-[8px] transition-[border-color,background-color,color] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
        isSearchClosing
          ? "border-[#8E8BED] bg-white text-[#1A1A1A]"
          : "site-header-search-field border-[#CACACA]"
      }`}
    >
      <button
        type="button"
        aria-label="Поиск"
        onClick={handleSearchToggle}
        className="flex h-5 w-5 shrink-0 items-center justify-center outline-none focus:outline-none focus-visible:outline-none"
      >
        <SearchIcon className="h-full w-full" />
      </button>
      <input
        ref={searchInputRef}
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setActiveSearchSuggestionIndex(-1);
        }}
        onKeyDown={handleSearchInputKeyDown}
        placeholder={isCompact ? "Поиск по объявлениям" : ""}
        aria-label="Поиск по объявлениям"
        tabIndex={isSearchClosing ? -1 : 0}
        className={
          isSearchClosing
            ? "pointer-events-none absolute h-0 w-0 opacity-0"
            : isCompact
              ? "h-auto min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-[1.3] text-[#1A1A1A] outline-none ring-0 placeholder:text-[#1A1A1A]/60 focus:outline-none focus:ring-0 focus-visible:outline-none"
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
  );

  const searchSuggestionsList = (
    <>
      {isSearchLoading ? (
        <p className="px-[16px] py-[14px] text-[16px] text-[#626262]">Ищем...</p>
      ) : searchSuggestions.length > 0 ? (
        <ul className="overflow-y-auto">
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
                className={`block w-full px-[16px] py-[14px] text-left text-[16px] text-[#626262] outline-none transition hover:bg-[#1A1A1A]/6 focus:outline-none focus-visible:outline-none ${
                  index === activeSearchSuggestionIndex ? "bg-[#1A1A1A]/6" : ""
                }`}
              >
                {suggestion.title}
              </button>
            </li>
          ))}
        </ul>
      ) : searchQuery.trim().length >= 2 ? (
        <p className="px-[16px] py-[14px] text-[16px] text-[#626262]">Ничего не найдено</p>
      ) : (
        <p className="px-[16px] py-[14px] text-[16px] text-[#626262]">
          Начните вводить название объявления
        </p>
      )}
    </>
  );

  const searchSuggestionsDropdown = suggestionsRendered ? (
    <div
      className={`site-header-search site-header-search-dropdown overlay-pop absolute left-0 top-[36px] z-[70] w-full overflow-hidden rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.28)]${suggestionsVisible ? " is-open" : ""}`}
      aria-hidden={!suggestionsVisible}
    >
      {isSearchLoading ? (
        <p className="px-[12px] py-[10px] text-[14px] text-[#626262]">Ищем...</p>
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
                className={`block w-full px-[12px] py-[10px] text-left text-[14px] text-[#626262] outline-none transition hover:bg-[#1A1A1A]/6 focus:outline-none focus-visible:outline-none ${
                  index === activeSearchSuggestionIndex ? "bg-[#1A1A1A]/6" : ""
                }`}
              >
                {suggestion.title}
              </button>
            </li>
          ))}
        </ul>
      ) : searchQuery.trim().length >= 2 ? (
        <p className="px-[12px] py-[10px] text-[14px] text-[#626262]">Ничего не найдено</p>
      ) : null}
    </div>
  ) : null;

  const authActions = (
    <>
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
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (showExpandedSearch) {
                    closeSearchWithAnimation({ clear: true });
                  }
                  togglePanel("notifications");
                }}
                className="relative"
              >
                <BellIcon className="h-5 w-5" />
                {hasUnreadNotifications ? (
                  <span aria-hidden className="unread-dot unread-dot--bell" />
                ) : null}
              </IconButton>
            }
          >
            <NotificationsDropdown
              isOpen={openPanel === "notifications"}
              onNavigate={() => setOpenPanel(null)}
            />
          </HeaderDropdown>

          {/* Compact: favorites are in the bottom nav — uncomment / remove `hidden` to restore in header */}
          <div className={isCompact ? "hidden" : "contents"}>
            <IconButton
              label="Избранное"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (showExpandedSearch) {
                  closeSearchWithAnimation({ clear: true });
                }
                router.push("/favorites");
              }}
            >
              <HeartIcon className="h-5 w-5" />
            </IconButton>
          </div>

          <HeaderDropdown
            open={openPanel === "profile"}
            onOpenChange={(open) => setOpenPanel(open ? "profile" : null)}
            panelLabel="Профиль"
            trigger={
              // Compact: profile is in the bottom nav; keep dropdown mounted for the sheet.
              <span className={isCompact ? "hidden" : "contents"}>
                <Avatar
                  initial={user.avatarInitial}
                  src={user.avatarUrl}
                  aria-expanded={openPanel === "profile"}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (showExpandedSearch) {
                      closeSearchWithAnimation({ clear: true });
                    }
                    togglePanel("profile");
                  }}
                />
              </span>
            }
          >
            <ProfileDropdown onClose={() => setOpenPanel(null)} />
          </HeaderDropdown>
        </>
      ) : (
        // Compact: login is in the bottom nav — remove `hidden` to restore in header
        <span className={isCompact ? "hidden" : "contents"}>
          <LoginButton />
        </span>
      )}
    </>
  );

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-1 w-full shrink-0" aria-hidden="true" />
      <header
        className="site-header fixed inset-x-0 top-0 z-50 h-[54px]"
        data-scrolled={isScrolled ? "true" : undefined}
        data-home={isHomePage ? "true" : undefined}
        data-compact={isCompact ? "true" : undefined}
      >
        <div className="site-header__backdrop" aria-hidden="true" />

        {isCompact ? (
          <div className="site-header__inner relative mx-auto h-full w-full max-w-[1440px]">
            <div className="site-header-compact-inset flex h-full items-center gap-[8px]">
              <div className="flex h-[54px] w-[162px] shrink-0 items-center">
                <Logo tone={logoTone} />
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-[8px] sm:gap-[12px]">
                {/* Compact: search is in the bottom nav — remove `hidden` to restore in header */}
                <div className="relative z-[50] hidden">
                  <button
                    ref={searchToggleRef}
                    type="button"
                    aria-label="Поиск"
                    aria-expanded={showExpandedSearch && !isSearchClosing}
                    onClick={handleSearchToggle}
                    className={`flex h-[32px] w-[32px] items-center justify-center rounded-[31px] border-[0.3px] border-solid bg-white text-[#1A1A1A] transition-colors hover:bg-[#f0e8ff] ${
                      showExpandedSearch && !isSearchClosing
                        ? "border-[#8E8BED] bg-[#f0e8ff]"
                        : "border-[#8E8BED]"
                    }`}
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                </div>

                {authActions}

                <IconButton
                  label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                  variant="accent"
                  aria-expanded={isMobileMenuOpen}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setOpenPanel(null);
                    if (showExpandedSearch) {
                      closeSearchWithAnimation({ clear: true });
                    }
                    setIsMobileMenuOpen((current) => !current);
                  }}
                >
                  <BurgerIcon className="text-[#1A1A1A]" />
                </IconButton>
              </div>
            </div>

            {mountCompactSearch && typeof document !== "undefined"
              ? createPortal(
                  <div
                    className={`site-header-compact-search ${compactSearchVisible || (isSearchExpanded && !isSearchClosing) ? "is-open" : ""}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Поиск"
                  >
                    <div ref={searchRef} className="site-header-compact-search__sheet">
                      <div className="site-header-compact-search__field">{searchField}</div>
                      <div
                        ref={searchResultsRef}
                        className="site-header-compact-search__results"
                      >
                        {searchSuggestionsList}
                      </div>
                    </div>
                  </div>,
                  document.body,
                )
              : null}
          </div>
        ) : (
          <div className="site-header__inner relative mx-auto flex h-full w-full max-w-[1440px] items-center gap-[16px]">
            <div className="flex h-[54px] w-[162px] shrink-0 items-center">
              <Logo tone={logoTone} />
            </div>

            <HeaderCategoriesDropdown />

            <div className="flex min-w-0 flex-1 items-center justify-end">
              <div
                ref={searchRef}
                className={`relative z-[50] h-[32px] transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                  desktopSearchExpanded ? "w-full min-w-[160px]" : "w-[32px]"
                }`}
              >
                <div className="h-full w-full overflow-hidden">
                  {showExpandedSearch ? (
                    searchField
                  ) : (
                    <button
                      type="button"
                      aria-label="Поиск"
                      onClick={handleSearchToggle}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[31px] border-[0.3px] border-solid border-[#8E8BED] bg-white text-[#1A1A1A] transition-colors hover:bg-[#f0e8ff]"
                    >
                      <SearchIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {searchSuggestionsDropdown}
              </div>
            </div>

            <div className="flex h-[32px] shrink-0 items-center justify-end gap-[16px]">
              <ButtonPrimary className="w-[243px] shrink-0" onClick={handleCreateListing}>
                Разместить объявление
              </ButtonPrimary>

              {authActions}
            </div>
          </div>
        )}
      </header>

      {isCompact ? (
        <HeaderMobileMenu
          open={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onCreateListing={handleCreateListing}
        />
      ) : null}

      {isCompact ? (
        <MobileBottomNav
          searchActive={Boolean(showExpandedSearch && !isSearchClosing)}
          onSearchClick={() => {
            setOpenPanel(null);
            setIsMobileMenuOpen(false);
            handleSearchToggle();
          }}
          onProfileClick={() => {
            setIsMobileMenuOpen(false);
            if (showExpandedSearch) {
              closeSearchWithAnimation({ clear: true });
            }
            togglePanel("profile");
          }}
        />
      ) : null}
    </>
  );
}
