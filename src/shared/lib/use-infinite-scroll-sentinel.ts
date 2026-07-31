"use client";

import { useEffect, useRef } from "react";

type UseInfiniteScrollSentinelOptions = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  /** Reset scroll-unlock when this changes (e.g. filters). */
  resetKey?: string | number;
};

/**
 * IntersectionObserver sentinel for infinite lists.
 * Requires a real user scroll/wheel/touch before loading the next page
 * (avoids auto-chaining when the first page does not fill the viewport).
 */
export function useInfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  resetKey,
}: UseInfiniteScrollSentinelOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollUnlockedRef = useRef(false);

  useEffect(() => {
    scrollUnlockedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    const unlock = () => {
      scrollUnlockedRef.current = true;
    };

    window.addEventListener("scroll", unlock, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchmove", unlock, { passive: true });

    return () => {
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchmove", unlock);
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!scrollUnlockedRef.current || isFetchingNextPage) return;
        fetchNextPage();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return sentinelRef;
}
