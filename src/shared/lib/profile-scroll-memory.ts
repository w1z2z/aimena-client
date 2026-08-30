/** Preserves window scrollY across in-profile tab navigations (desktop only). */

import { useEffect } from "react";

import { MQ } from "@/shared/lib/breakpoints";

let savedScrollY = 0;
let lastPathname: string | null = null;

function isMobileProfileViewport() {
  return typeof window !== "undefined" && window.matchMedia(MQ.tablet).matches;
}

export function saveProfileScrollPosition() {
  if (typeof window === "undefined") return;
  if (isMobileProfileViewport()) {
    savedScrollY = 0;
    return;
  }
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

  // Mobile profile is stacked (avatar → listings). Always open from the top.
  if (isMobileProfileViewport()) {
    forceScrollTop();
    return;
  }

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

export function resetProfileScrollPosition() {
  savedScrollY = 0;
}

export function forceScrollTop() {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) main.scrollTop = 0;
}

/** Repeated top pin — fights browser scroll restoration after content paints. */
export function pinScrollTop(delaysMs: number[] = [0, 50, 150]) {
  if (typeof window === "undefined") return () => {};

  window.history.scrollRestoration = "manual";

  let cancelled = false;
  let frameId = 0;
  const timerIds: number[] = [];

  const cleanup = () => {
    if (cancelled) return;
    cancelled = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    timerIds.forEach((id) => window.clearTimeout(id));
    window.removeEventListener("wheel", onUserIntent);
    window.removeEventListener("pointerdown", onUserIntent);
    window.removeEventListener("touchstart", onUserIntent);
    window.removeEventListener("touchmove", onUserIntent);
    window.removeEventListener("scroll", onScroll);
  };

  const pin = () => {
    if (cancelled) return;
    forceScrollTop();
  };

  const onUserIntent = () => {
    cleanup();
  };

  const onScroll = () => {
    if (window.scrollY > 1) cleanup();
  };

  pin();
  frameId = window.requestAnimationFrame(pin);
  delaysMs.forEach((ms) => timerIds.push(window.setTimeout(pin, ms)));

  window.addEventListener("wheel", onUserIntent, { passive: true });
  window.addEventListener("pointerdown", onUserIntent, { passive: true });
  window.addEventListener("touchstart", onUserIntent, { passive: true });
  window.addEventListener("touchmove", onUserIntent, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  return cleanup;
}

export function isOwnProfileTabRoute(pathname: string) {
  return pathname === "/profile" || pathname.startsWith("/profile/");
}

export function getPublicProfileSlug(pathname: string) {
  const match = pathname.match(/^\/users\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Tab switches inside the same profile shell — keep scroll position (desktop). */
export function isSameProfileTabNavigation(from: string, to: string) {
  if (from === to) return false;

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

/** Keep scroll position fresh while the profile shell is mounted (desktop). */
export function useProfileScrollTracker() {
  useEffect(() => {
    if (isMobileProfileViewport()) {
      resetProfileScrollPosition();
      return;
    }

    const onScroll = () => saveProfileScrollPosition();

    saveProfileScrollPosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
