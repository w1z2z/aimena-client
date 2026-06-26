"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth";

import { Avatar } from "./Avatar";
import { ButtonPrimary } from "./ButtonPrimary";
import { HeaderDropdown } from "./HeaderDropdown";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LoginButton } from "./LoginButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { BellDotIcon, BellIcon, HeartIcon } from "@/shared/ui/icons";

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
  const { isAuthenticated, user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  const togglePanel = useCallback((panel: Exclude<OpenPanel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

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

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-1 w-full shrink-0" aria-hidden="true" />
      <header
        className="site-header fixed inset-x-0 top-0 z-50 h-[54px]"
        data-scrolled={isScrolled ? "true" : undefined}
      >
        <div className="site-header__backdrop" aria-hidden="true" />
        <div className="site-header__inner relative mx-auto h-full w-full max-w-[1440px]">
          <div className="absolute left-[10px] top-0 flex h-[54px] items-start">
            <Logo />
          </div>

          <div className="absolute left-[1049px] top-[11px] flex items-center justify-end gap-[16px]">
            <ButtonPrimary>Разместить предложение</ButtonPrimary>

            <IconButton label="Избранное">
              <HeartIcon className="h-[11px] w-[13px] text-black" />
            </IconButton>

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
                  <span className="relative inline-flex items-center justify-center">
                    <BellIcon className="h-[16.4px] w-[14.6px] text-black" />
                    {openPanel !== "notifications" ? (
                      <BellDotIcon className="absolute -right-[3px] -top-[3px] h-[5px] w-[5px] text-[#FF2056]" />
                    ) : null}
                  </span>
                </IconButton>
              }
            >
              <NotificationsDropdown />
            </HeaderDropdown>

            {isAuthenticated && user ? (
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
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </header>
    </>
  );
}
