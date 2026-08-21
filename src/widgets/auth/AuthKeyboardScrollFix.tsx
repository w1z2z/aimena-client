"use client";

import { useEffect } from "react";

function isFormField(el: EventTarget | null): el is HTMLElement {
  return (
    el instanceof HTMLElement &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")
  );
}

function isCitySelectField(el: HTMLElement): boolean {
  return Boolean(el.closest(".site-select, .auth-city-select"));
}

function scrollPageToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Auth forms on iOS:
 * - focus → scroll the field into view (above keyboard)
 * - keyboard close → snap page back to top
 * - city/combobox select → no page auto-scroll (dropdown tracks the field itself)
 */
export function AuthKeyboardScrollFix() {
  useEffect(() => {
    let lastViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    let resetTimer: number | undefined;
    let focusScrollTimer: number | undefined;

    const cancelReset = () => {
      window.clearTimeout(resetTimer);
      resetTimer = undefined;
    };

    const scheduleResetToTop = () => {
      cancelReset();
      resetTimer = window.setTimeout(scrollPageToTop, 120);
    };

    const scrollFieldIntoView = (field: HTMLElement) => {
      window.clearTimeout(focusScrollTimer);
      focusScrollTimer = window.setTimeout(() => {
        field.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
      }, 280);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!isFormField(event.target)) return;
      cancelReset();
      // Combobox opens a portaled list that follows the trigger — don't yank the page
      if (isCitySelectField(event.target)) return;
      scrollFieldIntoView(event.target);
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!isFormField(event.target)) return;
      if (isCitySelectField(event.target)) return;
      if (isFormField(event.relatedTarget)) return;
      scheduleResetToTop();
    };

    const onViewportResize = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight;
      if (nextHeight > lastViewportHeight + 40 && !isFormField(document.activeElement)) {
        scheduleResetToTop();
      }
      lastViewportHeight = nextHeight;
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      cancelReset();
      window.clearTimeout(focusScrollTimer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  return null;
}
