"use client";

import { useSyncExternalStore } from "react";

/** Density steps for fitting the home hero fold on short phones. */
export type ViewportHeightDensity = "comfortable" | "cozy" | "dense";

function readDensity(): ViewportHeightDensity {
  const h =
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 900;
  // Fold target: header → categories → lime → rec cards (view-all can be below).
  if (h < 640) return "dense";
  if (h < 720) return "cozy";
  return "comfortable";
}

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  window.addEventListener("resize", onChange, { passive: true });
  vv?.addEventListener("resize", onChange);
  vv?.addEventListener("scroll", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    vv?.removeEventListener("resize", onChange);
    vv?.removeEventListener("scroll", onChange);
  };
}

export function useViewportHeightDensity(): ViewportHeightDensity {
  return useSyncExternalStore(subscribe, readDensity, () => "comfortable");
}
