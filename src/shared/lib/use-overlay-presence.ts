"use client";

import { useEffect, useState } from "react";

import { OVERLAY_ANIMATION_MS } from "@/shared/lib/overlay-animation";

/**
 * Keeps overlay mounted through the close animation.
 * Open: wait one paint in the closed state, then flip to visible
 * (Safari often skips the enter transition without this).
 */
export function useOverlayPresence(open: boolean, durationMs = OVERLAY_ANIMATION_MS) {
  const [isRendered, setIsRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setIsVisible(false);

      let timeoutId = 0;
      const frameId = window.requestAnimationFrame(() => {
        // Second tick: Safari needs a painted closed frame before transitioning.
        timeoutId = window.setTimeout(() => {
          setIsVisible(true);
        }, 16);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(timeoutId);
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setIsRendered(false), durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [open, durationMs]);

  return { isRendered, isVisible };
}
