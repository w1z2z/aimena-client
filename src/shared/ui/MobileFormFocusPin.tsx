"use client";

import { useEffect } from "react";

import { MQ } from "@/shared/lib/breakpoints";
import { cancelScrollPin, pinScrollAroundFocus } from "@/shared/lib/pin-window-scroll";
import { useMediaQuery } from "@/shared/lib/use-media-query";

const TAP_MOVE_THRESHOLD_PX = 10;

function isTextFormControl(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  const type = (target.type || "text").toLowerCase();
  return ![
    "checkbox",
    "radio",
    "range",
    "file",
    "button",
    "submit",
    "reset",
    "hidden",
    "image",
  ].includes(type);
}

function shouldSkipPin(target: HTMLElement): boolean {
  if (target.closest(".site-header-compact-search")) return true;
  // Auth has its own keyboard scroll assist.
  if (target.closest(".auth-page-shell")) return true;
  return false;
}

function focusWithoutScroll(target: HTMLElement) {
  if (typeof target.focus !== "function") return;
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  pinScrollAroundFocus();
}

type PendingTouch = {
  target: HTMLElement;
  startX: number;
  startY: number;
  moved: boolean;
};

/**
 * Compact / touch: reduce page jump on intentional field focus without stealing scroll
 * gestures that start on top of inputs (common on the home hero fold).
 */
export function MobileFormFocusPin() {
  const isCompact = useMediaQuery(MQ.compact);

  useEffect(() => {
    if (!isCompact) return;

    let pendingTouch: PendingTouch | null = null;

    const clearPendingTouch = () => {
      pendingTouch = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target;
      if (!isTextFormControl(target)) return;
      if (shouldSkipPin(target)) return;

      pendingTouch = {
        target,
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY,
        moved: false,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pendingTouch || event.touches.length !== 1) return;

      const dx = Math.abs(event.touches[0].clientX - pendingTouch.startX);
      const dy = Math.abs(event.touches[0].clientY - pendingTouch.startY);
      if (dx <= TAP_MOVE_THRESHOLD_PX && dy <= TAP_MOVE_THRESHOLD_PX) return;

      pendingTouch.moved = true;

      if (document.activeElement === pendingTouch.target) {
        pendingTouch.target.blur();
        cancelScrollPin();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!pendingTouch) return;

      const { target, moved } = pendingTouch;
      clearPendingTouch();

      if (moved) return;
      if (!isTextFormControl(target)) return;
      if (shouldSkipPin(target)) return;
      if (document.activeElement === target) return;

      focusWithoutScroll(target);
      event.preventDefault();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!isTextFormControl(target)) return;
      if (shouldSkipPin(target)) return;
      pinScrollAroundFocus();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });
    document.addEventListener("touchend", onTouchEnd, { passive: false, capture: true });
    document.addEventListener("touchcancel", clearPendingTouch, { capture: true });
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("touchstart", onTouchStart, { capture: true });
      document.removeEventListener("touchmove", onTouchMove, { capture: true });
      document.removeEventListener("touchend", onTouchEnd, { capture: true });
      document.removeEventListener("touchcancel", clearPendingTouch, { capture: true });
      document.removeEventListener("focusin", onFocusIn);
      clearPendingTouch();
    };
  }, [isCompact]);

  return null;
}
