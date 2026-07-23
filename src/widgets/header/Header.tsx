"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth, useAuthGate } from "@/features/auth";
import { getListings } from "@/shared/api/listings";

import { Avatar } from "./Avatar";
import { ButtonPrimary } from "./ButtonPrimary";
import { HeaderDropdown } from "./HeaderDropdown";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LoginButton } from "./LoginButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { BellDotIcon, BellIcon, HeartIcon, SearchIcon } from "@/shared/ui/icons";

type OpenPanel = "notifications" | "profile" | null;

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
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeSearchSuggestionIndex, setActiveSearchSuggestionIndex] = useState<number>(-1);

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
    if (!isSearchExpanded) return;

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
  }, [isSearchExpanded]);

  useEffect(() => {
    if (!isSearchExpanded || searchSuggestions.length === 0) {
      setActiveSearchSuggestionIndex(-1);
      return;
    }

    setActiveSearchSuggestionIndex((current) => {
      if (current >= 0 && current < searchSuggestions.length) return current;
      return 0;
    });
  }, [isSearchExpanded, searchSuggestions]);

  useEffect(() => {
    return () => {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSearchExpanded) {
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
          const uniqueTitles = Array.from(
            new Set(
              response.data
                .map((listing) => listing.title.trim())
                .filter((title): title is string => title.length > 0),
            ),
          ).slice(0, 8);

          setSearchSuggestions(uniqueTitles);
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
  }, [isSearchExpanded, searchQuery]);

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

  const closeSearchWithAnimation = () => {
    if (searchCloseTimerRef.current !== null) {
      window.clearTimeout(searchCloseTimerRef.current);
    }

    setIsSearchClosing(true);
    setIsSearchExpanded(false);
    setActiveSearchSuggestionIndex(-1);
    searchCloseTimerRef.current = window.setTimeout(() => {
      setIsSearchClosing(false);
      searchCloseTimerRef.current = null;
    }, 300);
  };

  const handleSearchToggle = () => {
    if (!isSearchExpanded) {
      if (searchCloseTimerRef.current !== null) {
        window.clearTimeout(searchCloseTimerRef.current);
        searchCloseTimerRef.current = null;
      }
      setIsSearchClosing(false);
      setIsSearchExpanded(true);
      setActiveSearchSuggestionIndex(-1);
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
      return;
    }

    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      return;
    }

    closeSearchWithAnimation();
  };

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-1 w-full shrink-0" aria-hidden="true" />
      <header
        className="site-header fixed inset-x-0 top-0 z-50 h-[54px]"
        data-scrolled={isScrolled ? "true" : undefined}
      >
        <div className="site-header__backdrop" aria-hidden="true" />
        <div className="site-header__inner relative mx-auto h-full w-full max-w-[1440px]">
          <div className="absolute left-[3px] top-[5px] flex h-[41px] w-[101px] items-start">
            <Logo />
          </div>

          <div
            ref={searchRef}
            className={`absolute top-[10px] h-[32px] transition-all duration-300 ease-out ${
              isSearchExpanded ? "left-[136px] w-[903px]" : "left-[1007px] w-[32px]"
            }`}
          >
            {isSearchExpanded || isSearchClosing ? (
              <div className="flex h-full w-full items-center gap-[9px] rounded-[13px] border border-[#8E8BED] border-[0.5px] bg-transparent px-[8px]">
                <button
                  type="button"
                  aria-label="Поиск"
                  onClick={handleSearchToggle}
                  className="flex h-[16px] w-[16px] shrink-0 items-center justify-center text-[#8E8BED]"
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
                        current < 0 ? searchSuggestions.length - 1 : (current - 1 + searchSuggestions.length) % searchSuggestions.length,
                      );
                      return;
                    }

                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (
                        activeSearchSuggestionIndex >= 0 &&
                        activeSearchSuggestionIndex < searchSuggestions.length
                      ) {
                        const pickedTitle = searchSuggestions[activeSearchSuggestionIndex];
                        setSearchQuery(pickedTitle);
                        router.push(`/listings?search=${encodeURIComponent(pickedTitle)}`);
                        closeSearchWithAnimation();
                        return;
                      }

                      if (searchQuery.trim()) {
                        router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }
                  }}
                  placeholder=""
                  aria-label="Поиск по объявлениям"
                  className="h-[24px] w-[220px] bg-transparent text-[14px] font-normal leading-[170%] text-[#8E8BED] outline-none placeholder:text-[#8E8BED]"
                />
              </div>
            ) : (
              <button
                type="button"
                aria-label="Поиск"
                onClick={handleSearchToggle}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[13px] border border-[#8E8BED] border-[0.3px] bg-transparent text-[#8E8BED] transition hover:bg-[#8E8BED]/5 active:translate-y-[0.5px]"
              >
                <SearchIcon className="h-[13px] w-[13px]" />
              </button>
            )}

            {isSearchExpanded && (isSearchLoading || searchQuery.trim().length >= 2) ? (
              <div className="absolute left-0 top-[36px] z-[70] w-full overflow-hidden rounded-[10px] border border-[#8E8BED] border-[0.5px] bg-transparent shadow-[0_8px_24px_rgba(15,23,42,0.14)] backdrop-blur-[2px]">
                {isSearchLoading ? (
                  <p className="px-[12px] py-[10px] text-[14px] text-[#8E8BED]">Ищем...</p>
                ) : searchSuggestions.length > 0 ? (
                  <ul className="max-h-[260px] overflow-y-auto">
                    {searchSuggestions.map((title, index) => (
                      <li key={title}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSearchSuggestionIndex(index)}
                          onClick={() => {
                            setSearchQuery(title);
                            router.push(`/listings?search=${encodeURIComponent(title)}`);
                            closeSearchWithAnimation();
                          }}
                          className={`block w-full px-[12px] py-[10px] text-left text-[14px] text-[#8E8BED] transition hover:bg-[#8E8BED]/10 ${
                            index === activeSearchSuggestionIndex ? "bg-[#8E8BED]/10" : ""
                          }`}
                        >
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.trim().length >= 2 ? (
                  <p className="px-[12px] py-[10px] text-[14px] text-[#8E8BED]">Ничего не найдено</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="absolute left-[1049px] top-[11px] flex h-[32px] w-[387px] items-center justify-end gap-[16px]">
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
                      <span className="relative block h-[32px] w-[32px]">
                        <BellIcon className="absolute left-[28.12%] top-[9px] h-[14.62px] w-[13.81px] text-black" />
                        {openPanel !== "notifications" ? (
                          <>
                            <BellDotIcon className="absolute left-[19px] top-[4px] h-[7px] w-[7px] text-[#FF2056]/25" />
                            <BellDotIcon className="absolute left-[20px] top-[5px] h-[5px] w-[5px] text-[#FF2056]" />
                          </>
                        ) : null}
                      </span>
                    </IconButton>
                  }
                >
                  <NotificationsDropdown />
                </HeaderDropdown>

                <IconButton label="Избранное" onClick={() => router.push("/favorites")}>
                  <span className="relative block h-[32px] w-[32px]">
                    <HeartIcon className="absolute left-1/2 top-[10px] h-[13px] w-[16px] -translate-x-1/2 text-black" />
                  </span>
                </IconButton>

                <HeaderDropdown
                  open={openPanel === "profile"}
                  onOpenChange={(open) => setOpenPanel(open ? "profile" : null)}
                  panelLabel="Профиль"
                  trigger={
                    <Avatar
                      initial={user.avatarInitial}
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
