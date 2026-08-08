import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  CARD_STEP,
  CAROUSEL_AUTO_ADVANCE_MS,
  CAROUSEL_SCROLL_END_FALLBACK_MS,
} from "./constants";

export function useInfiniteCarousel(itemCount: number) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isSettlingRef = useRef(false);
  const isAutoAdvancePausedRef = useRef(false);

  const getStep = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || carousel.children.length < 2) return CARD_STEP;
    const first = carousel.children[0] as HTMLElement;
    const second = carousel.children[1] as HTMLElement;
    const measured = second.offsetLeft - first.offsetLeft;
    return measured > 0 ? measured : CARD_STEP;
  }, []);

  /** Instant seamless loop only — never round-snap (that jerks cards mid-scroll). */
  const wrapLoopIfNeeded = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    const step = getStep();
    const loopWidth = step * itemCount;
    if (loopWidth <= 0) return;

    const current = carousel.scrollLeft;
    let next = current;

    if (current >= loopWidth * 2) {
      next = current - loopWidth;
    } else if (current < loopWidth) {
      next = current + loopWidth;
    }

    if (Math.abs(next - current) < 0.5) return;

    isSettlingRef.current = true;
    carousel.scrollLeft = next;
    requestAnimationFrame(() => {
      isSettlingRef.current = false;
    });
  }, [getStep, itemCount]);

  const snapToNearestStep = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    const step = getStep();
    const loopWidth = step * itemCount;
    const current = carousel.scrollLeft;
    let target = Math.round(current / step) * step;

    if (target >= loopWidth * 2) target -= loopWidth;
    else if (target < loopWidth) target += loopWidth;

    if (Math.abs(target - current) < 1) {
      wrapLoopIfNeeded();
      return;
    }

    isProgrammaticScrollRef.current = true;
    carousel.scrollTo({ left: target, behavior: "smooth" });
  }, [getStep, itemCount, wrapLoopIfNeeded]);

  const settleScroll = useCallback(() => {
    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = null;
    }
    isProgrammaticScrollRef.current = false;
    snapToNearestStep();
  }, [snapToNearestStep]);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    const step = getStep();
    isSettlingRef.current = true;
    carousel.scrollLeft = step * itemCount;
    requestAnimationFrame(() => {
      isSettlingRef.current = false;
    });
  }, [getStep, itemCount]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scheduleSettle = () => {
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = window.setTimeout(() => {
        scrollEndTimerRef.current = null;
        settleScroll();
      }, CAROUSEL_SCROLL_END_FALLBACK_MS);
    };

    const handleScrollEnd = () => {
      if (isSettlingRef.current) return;
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      // After programmatic smooth snap finishes — only wrap, don't snap again.
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        wrapLoopIfNeeded();
        return;
      }
      settleScroll();
    };

    const handleScroll = () => {
      if (isSettlingRef.current) return;
      if (isProgrammaticScrollRef.current) return;
      scheduleSettle();
    };

    carousel.addEventListener("scrollend", handleScrollEnd);
    carousel.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      carousel.removeEventListener("scrollend", handleScrollEnd);
      carousel.removeEventListener("scroll", handleScroll);
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [settleScroll, wrapLoopIfNeeded]);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const carousel = carouselRef.current;
      if (!carousel || itemCount <= 0) return;

      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }

      wrapLoopIfNeeded();
      isProgrammaticScrollRef.current = true;

      const step = getStep();
      const currentIndex = Math.round(carousel.scrollLeft / step);
      carousel.scrollTo({
        left: (currentIndex + direction) * step,
        behavior: "smooth",
      });
    },
    [getStep, itemCount, wrapLoopIfNeeded],
  );

  useEffect(() => {
    if (itemCount <= 1) return;
    const intervalId = window.setInterval(() => {
      if (isAutoAdvancePausedRef.current) return;
      scrollByStep(1);
    }, CAROUSEL_AUTO_ADVANCE_MS);
    return () => window.clearInterval(intervalId);
  }, [itemCount, scrollByStep]);

  const pauseAutoAdvance = useCallback(() => {
    isAutoAdvancePausedRef.current = true;
  }, []);

  const resumeAutoAdvance = useCallback(() => {
    isAutoAdvancePausedRef.current = false;
  }, []);

  return useMemo(
    () => ({
      carouselRef,
      scrollByStep,
      pauseAutoAdvance,
      resumeAutoAdvance,
    }),
    [pauseAutoAdvance, resumeAutoAdvance, scrollByStep],
  );
}
