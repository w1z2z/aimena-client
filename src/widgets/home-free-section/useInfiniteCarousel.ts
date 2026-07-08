import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  CARD_STEP,
  CAROUSEL_AUTO_ADVANCE_MS,
  CAROUSEL_SCROLL_END_FALLBACK_MS,
  getCarouselSetWidth,
} from "./constants";

export function useInfiniteCarousel(itemCount: number) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isAutoAdvancePausedRef = useRef(false);
  const setWidth = getCarouselSetWidth(itemCount);

  const normalizeScrollPosition = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || setWidth <= 0) return;

    let nextScrollLeft = Math.round(carousel.scrollLeft / CARD_STEP) * CARD_STEP;

    if (nextScrollLeft >= setWidth * 2) {
      nextScrollLeft -= setWidth;
    } else if (nextScrollLeft < setWidth) {
      nextScrollLeft += setWidth;
    }

    if (nextScrollLeft !== carousel.scrollLeft) {
      carousel.scrollLeft = nextScrollLeft;
    }
  }, [setWidth]);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollLeft = setWidth;
  }, [setWidth]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScrollEnd = () => {
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }

      isProgrammaticScrollRef.current = false;
      normalizeScrollPosition();
    };

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }

      scrollEndTimerRef.current = window.setTimeout(() => {
        scrollEndTimerRef.current = null;
        isProgrammaticScrollRef.current = false;
        normalizeScrollPosition();
      }, CAROUSEL_SCROLL_END_FALLBACK_MS);
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
  }, [normalizeScrollPosition]);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const carousel = carouselRef.current;
      if (!carousel || itemCount <= 0) return;

      isProgrammaticScrollRef.current = true;

      const currentIndex = Math.round(carousel.scrollLeft / CARD_STEP);
      const targetScrollLeft = (currentIndex + direction) * CARD_STEP;

      carousel.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    },
    [itemCount],
  );

  useEffect(() => {
    if (itemCount <= 1) return;

    const intervalId = window.setInterval(() => {
      if (isAutoAdvancePausedRef.current) return;
      scrollByStep(1);
    }, CAROUSEL_AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
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
