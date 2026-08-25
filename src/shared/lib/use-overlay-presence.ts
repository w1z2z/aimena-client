"use client";

import { useEffect, useState } from "react";

import { OVERLAY_ANIMATION_MS } from "@/shared/lib/overlay-animation";

/**
 * Keeps overlay mounted through the close animation.
 * Open: wait for painted closed frames, then flip to visible
 * (Safari/iOS often skips the enter transition without this).
 */
export function useOverlayPresence(open: boolean, durationMs = OVERLAY_ANIMATION_MS) {
  const [isRendered, setIsRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setIsVisible(false);

      let timeoutId = 0;
      let frameId2 = 0;
      // Double rAF: first schedules layout/paint, second runs after that paint.
      // Extra 32ms helps iOS Safari when portal + scroll-lock also mutate the tree.
      const frameId1 = window.requestAnimationFrame(() => {
        frameId2 = window.requestAnimationFrame(() => {
          timeoutId = window.setTimeout(() => {
            setIsVisible(true);
          }, 32);
        });
      });

      return () => {
        window.cancelAnimationFrame(frameId1);
        window.cancelAnimationFrame(frameId2);
        window.clearTimeout(timeoutId);
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setIsRendered(false), durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [open, durationMs]);

  return { isRendered, isVisible };
}
