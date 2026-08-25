"use client";

import { useEffect, useState, type RefObject } from "react";

import { useScrollLock } from "@/shared/lib/use-scroll-lock";

/**
 * Locks page scroll for an overlay, but only after the open class has been
 * painted. Applying overflow:hidden in the same turn as `is-open` often
 * cancels CSS enter transitions on iOS Safari.
 */
export function useOverlayScrollLock(
  isRendered: boolean,
  isVisible: boolean,
  allowScrollRef?: RefObject<HTMLElement | null>,
) {
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    if (!isRendered) {
      setScrollLocked(false);
      return;
    }

    if (!isVisible) return;

    const frameId = window.requestAnimationFrame(() => {
      setScrollLocked(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isRendered, isVisible]);

  useScrollLock(scrollLocked, allowScrollRef);
}
