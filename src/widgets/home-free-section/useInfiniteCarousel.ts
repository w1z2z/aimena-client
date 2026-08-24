import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  CARD_STEP,
  CAROUSEL_AUTO_ADVANCE_MS,
} from "./constants";

/** Clear stuck "auto scrolling" if scrollend never fires (some WebKit builds). */
const AUTO_SCROLL_UNLOCK_MS = 1400;

export function useInfiniteCarousel(itemCount: number) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isSettlingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  /** Ignore scrollend from instant teleports (they must not re-normalize mid-step). */
  const suppressScrollEndRef = useRef(0);
  const autoScrollUnlockTimerRef = useRef<number | null>(null);
  /** After a user gesture, wait one full interval before the next auto step. */
  const nextAutoAdvanceAtRef = useRef(0);

  const getCardStep = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || carousel.children.length < 2) return CARD_STEP;
    const first = carousel.children[0] as HTMLElement;
    const second = carousel.children[1] as HTMLElement;
    const measured = second.offsetLeft - first.offsetLeft;
    return measured > 0 ? measured : CARD_STEP;
  }, []);

  /** Exact pixel width of one listings copy (more accurate than step * count). */
  const getLoopWidth = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return 0;
    if (carousel.children.length < itemCount + 1) {
      return getCardStep() * itemCount;
    }
    const first = carousel.children[0] as HTMLElement;
    const middle = carousel.children[itemCount] as HTMLElement;
    const measured = middle.offsetLeft - first.offsetLeft;
    return measured > 0 ? measured : getCardStep() * itemCount;
  }, [getCardStep, itemCount]);

  const getPageSize = useCallback(() => {
    const carousel = carouselRef.current;
    const cardStep = getCardStep();
    if (!carousel || cardStep <= 0) return 1;

    const styles = window.getComputedStyle(carousel);
    const padL = Number.parseFloat(styles.paddingLeft) || 0;
    const padR = Number.parseFloat(styles.paddingRight) || 0;
    const contentWidth = Math.max(0, carousel.clientWidth - padL - padR);
    return Math.max(1, Math.round(contentWidth / cardStep));
  }, [getCardStep]);

  const usesCssSnap = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return false;
    const snapType = window.getComputedStyle(carousel).scrollSnapType;
    return snapType.includes("mandatory") || snapType.includes("proximity");
  }, []);

  const instantSetScrollLeft = useCallback((carousel: HTMLDivElement, left: number) => {
    const prevSnap = carousel.style.scrollSnapType;
    carousel.style.scrollSnapType = "none";
    carousel.scrollLeft = left;
    void carousel.offsetWidth;
    carousel.style.scrollSnapType = prevSnap;
  }, []);

  const normalizeScrollToMiddle = useCallback((scrollLeft: number, loopWidth: number) => {
    if (loopWidth <= 0) return scrollLeft;
    let next = scrollLeft;
    while (next >= loopWidth * 2) next -= loopWidth;
    while (next < loopWidth) next += loopWidth;
    return next;
  }, []);

  const normalizeToMiddleCopy = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    const loopWidth = getLoopWidth();
    if (loopWidth <= 0) return;

    const current = carousel.scrollLeft;
    const next = normalizeScrollToMiddle(current, loopWidth);
    if (Math.abs(next - current) < 0.5) return;

    suppressScrollEndRef.current += 1;
    isSettlingRef.current = true;
    instantSetScrollLeft(carousel, next);
    requestAnimationFrame(() => {
      isSettlingRef.current = false;
      suppressScrollEndRef.current = Math.max(0, suppressScrollEndRef.current - 1);
    });
  }, [getLoopWidth, instantSetScrollLeft, itemCount, normalizeScrollToMiddle]);

  const snapToNearestPage = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    if (usesCssSnap()) {
      normalizeToMiddleCopy();
      return;
    }

    const step = getCardStep();
    const pageStep = step * getPageSize();
    const loopWidth = getLoopWidth();
    if (pageStep <= 0 || loopWidth <= 0) return;

    const current = carousel.scrollLeft;
    let target = Math.round(current / pageStep) * pageStep;
    target = normalizeScrollToMiddle(target, loopWidth);

    if (Math.abs(target - current) < 1) {
      normalizeToMiddleCopy();
      return;
    }

    suppressScrollEndRef.current += 1;
    isSettlingRef.current = true;
    instantSetScrollLeft(carousel, target);
    requestAnimationFrame(() => {
      isSettlingRef.current = false;
      suppressScrollEndRef.current = Math.max(0, suppressScrollEndRef.current - 1);
    });
  }, [
    getCardStep,
    getLoopWidth,
    getPageSize,
    instantSetScrollLeft,
    itemCount,
    normalizeScrollToMiddle,
    normalizeToMiddleCopy,
    usesCssSnap,
  ]);

  const unlockAutoScroll = useCallback(() => {
    isAutoScrollingRef.current = false;
    if (autoScrollUnlockTimerRef.current !== null) {
      window.clearTimeout(autoScrollUnlockTimerRef.current);
      autoScrollUnlockTimerRef.current = null;
    }
  }, []);

  const armAutoScrollLock = useCallback(() => {
    isAutoScrollingRef.current = true;
    if (autoScrollUnlockTimerRef.current !== null) {
      window.clearTimeout(autoScrollUnlockTimerRef.current);
    }
    autoScrollUnlockTimerRef.current = window.setTimeout(() => {
      autoScrollUnlockTimerRef.current = null;
      isAutoScrollingRef.current = false;
    }, AUTO_SCROLL_UNLOCK_MS);
  }, []);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || itemCount <= 0) return;

    const loopWidth = getLoopWidth();
    suppressScrollEndRef.current += 1;
    isSettlingRef.current = true;
    instantSetScrollLeft(carousel, loopWidth > 0 ? loopWidth : getCardStep() * itemCount);
    requestAnimationFrame(() => {
      isSettlingRef.current = false;
      suppressScrollEndRef.current = Math.max(0, suppressScrollEndRef.current - 1);
    });
  }, [getCardStep, getLoopWidth, instantSetScrollLeft, itemCount]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const markUserInteraction = () => {
      if (isAutoScrollingRef.current || isSettlingRef.current) return;
      nextAutoAdvanceAtRef.current = performance.now() + CAROUSEL_AUTO_ADVANCE_MS;
    };

    const handleScrollEnd = () => {
      if (isSettlingRef.current || suppressScrollEndRef.current > 0) return;
      const wasProgrammatic = isAutoScrollingRef.current;
      unlockAutoScroll();
      // After arrow/autoplay: only wrap the loop (invisible). Don't re-snap — that fights the tween.
      if (wasProgrammatic) {
        normalizeToMiddleCopy();
        return;
      }
      snapToNearestPage();
    };

    let fallbackTimer: number | null = null;
    const handleScroll = () => {
      if (isSettlingRef.current || suppressScrollEndRef.current > 0) return;
      // Ignore scroll noise from programmatic arrow/autoplay (including seam tweens).
      if (isAutoScrollingRef.current) return;
      markUserInteraction();
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(() => {
        fallbackTimer = null;
        if (isSettlingRef.current || isAutoScrollingRef.current || suppressScrollEndRef.current > 0) {
          return;
        }
        snapToNearestPage();
      }, 80);
    };

    carousel.addEventListener("scrollend", handleScrollEnd);
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    carousel.addEventListener("pointerdown", markUserInteraction, { passive: true });

    return () => {
      carousel.removeEventListener("scrollend", handleScrollEnd);
      carousel.removeEventListener("scroll", handleScroll);
      carousel.removeEventListener("pointerdown", markUserInteraction);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    };
  }, [normalizeToMiddleCopy, snapToNearestPage, unlockAutoScroll]);

  /**
   * Move one page. If the next step would cross a copy seam, teleport to the
   * equivalent offset first (identical cards), then smooth-scroll — so the
   * loop never hard-stops on the last page and never visibly jumps after.
   */
  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const carousel = carouselRef.current;
      if (!carousel || itemCount <= 0) return;

      const step = getCardStep();
      const pageStep = step * getPageSize();
      const loopWidth = getLoopWidth();
      if (loopWidth <= 0 || pageStep <= 0) return;

      let from = normalizeScrollToMiddle(carousel.scrollLeft, loopWidth);
      from = Math.round(from / pageStep) * pageStep;
      while (from >= loopWidth * 2) from -= loopWidth;
      while (from < loopWidth) from += loopWidth;

      let target = from + direction * pageStep;

      if (target >= loopWidth * 2) {
        from -= loopWidth;
        target -= loopWidth;
      } else if (target < loopWidth) {
        from += loopWidth;
        target += loopWidth;
      }

      armAutoScrollLock();

      const runSmooth = () => {
        if (Math.abs(target - carousel.scrollLeft) < 0.5) {
          unlockAutoScroll();
          return;
        }
        carousel.scrollTo({ left: target, behavior: "smooth" });
      };

      if (Math.abs(carousel.scrollLeft - from) > 0.5) {
        // Teleport must not be treated as "scroll ended" or normalize snaps
        // back to the last page and kills the infinite loop.
        suppressScrollEndRef.current += 1;
        isSettlingRef.current = true;
        instantSetScrollLeft(carousel, from);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isSettlingRef.current = false;
            suppressScrollEndRef.current = Math.max(0, suppressScrollEndRef.current - 1);
            runSmooth();
          });
        });
        return;
      }

      runSmooth();
    },
    [
      armAutoScrollLock,
      getCardStep,
      getLoopWidth,
      getPageSize,
      instantSetScrollLeft,
      itemCount,
      normalizeScrollToMiddle,
      unlockAutoScroll,
    ],
  );

  useEffect(() => {
    if (itemCount <= 1) return;
    const intervalId = window.setInterval(() => {
      if (isAutoScrollingRef.current || isSettlingRef.current) return;
      if (performance.now() < nextAutoAdvanceAtRef.current) return;
      scrollByStep(1);
    }, CAROUSEL_AUTO_ADVANCE_MS);
    return () => window.clearInterval(intervalId);
  }, [itemCount, scrollByStep]);

  useEffect(() => {
    return () => {
      if (autoScrollUnlockTimerRef.current !== null) {
        window.clearTimeout(autoScrollUnlockTimerRef.current);
      }
    };
  }, []);

  return useMemo(
    () => ({
      carouselRef,
      scrollByStep,
    }),
    [scrollByStep],
  );
}
