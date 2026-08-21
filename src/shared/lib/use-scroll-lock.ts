"use client";

import { useEffect, useRef, type RefObject } from "react";

const SCROLL_LOCK_CLASS = "is-scroll-locked";

/**
 * Locks document scroll without `position: fixed` on body
 * (that turns fixed overlays into body-relative and the whole UI scrolls together).
 * Allows wheel/touch only inside `allowScrollRef`.
 */
export function useScrollLock(locked: boolean, allowScrollRef?: RefObject<HTMLElement | null>) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const { body } = document;
    scrollYRef.current = window.scrollY;

    html.classList.add(SCROLL_LOCK_CLASS);
    body.classList.add(SCROLL_LOCK_CLASS);
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    const scrollbarGap = window.innerWidth - html.clientWidth;
    const previousPaddingRight = body.style.paddingRight;
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    const isAllowedTarget = (target: EventTarget | null) => {
      const node = target instanceof Node ? target : null;
      const allow = allowScrollRef?.current;
      return Boolean(node && allow?.contains(node));
    };

    const preventIfOutside = (event: Event) => {
      if (isAllowedTarget(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener("wheel", preventIfOutside, { passive: false });
    document.addEventListener("touchmove", preventIfOutside, { passive: false });

    return () => {
      html.classList.remove(SCROLL_LOCK_CLASS);
      body.classList.remove(SCROLL_LOCK_CLASS);
      html.style.overflow = "";
      body.style.overflow = "";
      html.style.overscrollBehavior = "";
      body.style.overscrollBehavior = "";
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("wheel", preventIfOutside);
      document.removeEventListener("touchmove", preventIfOutside);
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked, allowScrollRef]);
}
