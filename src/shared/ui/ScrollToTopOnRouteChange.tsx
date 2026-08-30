"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getLastPathname,
  isOwnProfileTabRoute,
  isSameProfileTabNavigation,
  getPublicProfileSlug,
  pinScrollTop,
  resetProfileScrollPosition,
  restoreProfileScrollPosition,
  setLastPathname,
} from "@/shared/lib/profile-scroll-memory";
import { MQ } from "@/shared/lib/breakpoints";

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

function isProfilePath(pathname: string) {
  return isOwnProfileTabRoute(pathname) || Boolean(getPublicProfileSlug(pathname));
}

/**
 * Always land at the top when the route changes.
 * Skips hash targets (e.g. /#home-recommendations) so intentional in-page scrolls still work.
 * Desktop: keeps scroll across own/public profile tab switches.
 * Mobile profile: always pins to top (stacked layout).
 */
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    if (window.location.hash) return;

    const previousPathname = getLastPathname();
    setLastPathname(pathname);
    const mobile = window.matchMedia(MQ.tablet).matches;

    // Cold load / reload
    if (previousPathname == null) {
      resetProfileScrollPosition();
      return pinScrollTop();
    }

    // Mobile profile routes — never restore mid-page scroll
    if (mobile && isProfilePath(pathname)) {
      resetProfileScrollPosition();
      return pinScrollTop();
    }

    if (isSameProfileTabNavigation(previousPathname, pathname)) {
      restoreProfileScrollPosition();
      return;
    }

    resetProfileScrollPosition();
    return pinScrollTop();
  }, [pathname, search]);

  return null;
}
