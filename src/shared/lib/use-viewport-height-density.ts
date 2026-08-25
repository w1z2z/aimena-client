"use client";

import { useSyncExternalStore } from "react";

/** Density steps for fitting the home hero fold on short phones. */
export type ViewportHeightDensity = "comfortable" | "cozy" | "dense";

function densityFromHeight(h: number): ViewportHeightDensity {
  if (h < 640) return "dense";
  if (h < 720) return "cozy";
  return "comfortable";
}

/**
 * iOS Safari changes visualViewport height while scrolling (URL bar hide/show).
 * Locking height on first read avoids hero layout thrashing during scroll.
 */
let stableHeight: number | null = null;
let stableWidth: number | null = null;

function captureStableViewport() {
  if (typeof window === "undefined") return;
  stableHeight = window.innerHeight;
  stableWidth = window.innerWidth;
}

function readDensity(): ViewportHeightDensity {
  if (typeof window === "undefined") return "comfortable";
  if (stableHeight === null) captureStableViewport();
  return densityFromHeight(stableHeight ?? window.innerHeight);
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  if (stableHeight === null) captureStableViewport();

  const onOrientationChange = () => {
    captureStableViewport();
    onChange();
  };

  const onResize = () => {
    const width = window.innerWidth;
    const prevWidth = stableWidth ?? width;
    // Width jump ≈ rotation; ignore height-only resize (iOS URL bar).
    if (Math.abs(width - prevWidth) < 48) return;
    captureStableViewport();
    onChange();
  };

  window.addEventListener("orientationchange", onOrientationChange);
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.removeEventListener("orientationchange", onOrientationChange);
    window.removeEventListener("resize", onResize);
  };
}

export function useViewportHeightDensity(): ViewportHeightDensity {
  return useSyncExternalStore(subscribe, readDensity, () => "comfortable");
}
