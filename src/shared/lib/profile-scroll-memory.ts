/** Preserves window scrollY across in-profile tab navigations. */

import { useEffect } from "react";

let savedScrollY = 0;
let lastPathname: string | null = null;

export function saveProfileScrollPosition() {
  if (typeof window === "undefined") return;
  savedScrollY = window.scrollY;
}

export function getLastPathname() {
  return lastPathname;
}

export function setLastPathname(pathname: string) {
  lastPathname = pathname;
}

export function restoreProfileScrollPosition() {
  if (typeof window === "undefined") return;

  const y = savedScrollY;
  const restore = () => {
    window.scrollTo(0, y);
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = y;
    }
  };

  restore();
  window.requestAnimationFrame(restore);
  window.setTimeout(restore, 0);
  window.setTimeout(restore, 50);
  window.setTimeout(restore, 120);
}

export function isOwnProfileTabRoute(pathname: string) {
  return pathname === "/profile" || pathname.startsWith("/profile/");
}

export function getPublicProfileSlug(pathname: string) {
  const match = pathname.match(/^\/users\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Tab switches inside the same profile shell — keep scroll position. */
export function isSameProfileTabNavigation(from: string, to: string) {
  if (from === to) return true;

  if (isOwnProfileTabRoute(from) && isOwnProfileTabRoute(to)) {
    return true;
  }

  const fromSlug = getPublicProfileSlug(from);
  const toSlug = getPublicProfileSlug(to);
  if (fromSlug && toSlug && fromSlug === toSlug) {
    return true;
  }

  return false;
}

/** Keep scroll position fresh while the profile shell is mounted. */
export function useProfileScrollTracker() {
  useEffect(() => {
    const onScroll = () => saveProfileScrollPosition();

    saveProfileScrollPosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
