"use client";

import { useEffect } from "react";

function scrollPageToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * iOS Safari often leaves a stale window scroll offset after the soft keyboard
 * closes on auth forms. Snap the page back to the top when the keyboard dismisses.
 */
export function AuthKeyboardScrollFix() {
  useEffect(() => {
    let lastViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    let resetTimer: number | undefined;

    const scheduleReset = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(scrollPageToTop, 80);
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const tag = target.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return;
      scheduleReset();
    };

    const onViewportResize = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight;
      // Viewport grew → keyboard (or chrome) closed; undo the jump.
      if (nextHeight > lastViewportHeight + 40) {
        scheduleReset();
      }
      lastViewportHeight = nextHeight;
    };

    document.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      window.clearTimeout(resetTimer);
      document.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  return null;
}
