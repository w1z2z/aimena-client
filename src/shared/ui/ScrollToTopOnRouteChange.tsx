"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getLastPathname,
  isSameProfileTabNavigation,
  restoreProfileScrollPosition,
  setLastPathname,
} from "@/shared/lib/profile-scroll-memory";

export function forcePageScrollTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) main.scrollTop = 0;
}

/**
 * Always land at the top when the route changes.
 * Skips hash targets (e.g. /#home-recommendations) so intentional in-page scrolls still work.
 * Skips own/public profile tab switches (/profile/*, /users/:slug/*).
 */
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    if (window.location.hash) return;

    const previousPathname = getLastPathname() ?? pathname;
    setLastPathname(pathname);

    if (isSameProfileTabNavigation(previousPathname, pathname)) {
      restoreProfileScrollPosition();
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    forcePageScrollTop();

    // After paint / overlay unlock that may restore scrollY from a sheet.
    const frameId = window.requestAnimationFrame(forcePageScrollTop);
    const timerId = window.setTimeout(forcePageScrollTop, 0);
    const lateTimerId = window.setTimeout(forcePageScrollTop, 80);

    return () => {
      window.history.scrollRestoration = previous;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      window.clearTimeout(lateTimerId);
    };
  }, [pathname, search]);

  return null;
}
