import {
  type RefObject,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import {
  MODE_COLORED_HEIGHT_BROWSE,
  MODE_COLORED_HEIGHT_EXCHANGE,
  MODE_PANEL_DURATION,
  MODE_PANEL_GAP,
  MODE_WHITE_PANEL_HEIGHT,
} from "../constants";

export function isSafariBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Zen/i.test(ua);
}

export function useIsSafari() {
  return useSyncExternalStore(
    () => () => {},
    isSafariBrowser,
    () => false,
  );
}

export function easeOutQuint(progress: number) {
  return 1 - (1 - progress) ** 5;
}

export function useSafariPanelAnimation(
  isExchange: boolean,
  columnRef: RefObject<HTMLDivElement | null>,
  coloredRef: RefObject<HTMLDivElement | null>,
  whiteRef: RefObject<HTMLDivElement | null>,
) {
  const isSafari = useIsSafari();
  const animationRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  useLayoutEffect(() => {
    if (!isSafari) return;

    const column = columnRef.current;
    const colored = coloredRef.current;
    const white = whiteRef.current;
    if (!column || !colored || !white) return;

    const targetColored = isExchange ? MODE_COLORED_HEIGHT_EXCHANGE : MODE_COLORED_HEIGHT_BROWSE;
    const targetWhite = isExchange ? MODE_WHITE_PANEL_HEIGHT : 0;
    const targetGap = isExchange ? MODE_PANEL_GAP : 0;
    const targetWhiteOpacity = isExchange ? 1 : 0;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      colored.style.height = `${targetColored}px`;
      white.style.height = `${targetWhite}px`;
      column.style.gap = `${targetGap}px`;
      white.style.opacity = String(targetWhiteOpacity);
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startColored = colored.getBoundingClientRect().height;
    const startWhite = white.getBoundingClientRect().height;
    const startGap = Number.parseFloat(getComputedStyle(column).rowGap || getComputedStyle(column).gap) || 0;
    const startWhiteOpacity = Number.parseFloat(getComputedStyle(white).opacity) || 0;
    const startTime = performance.now();

    colored.style.transition = "none";
    white.style.transition = "none";
    column.style.transition = "none";

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / MODE_PANEL_DURATION);
      const eased = easeOutQuint(progress);

      colored.style.height = `${startColored + (targetColored - startColored) * eased}px`;
      white.style.height = `${startWhite + (targetWhite - startWhite) * eased}px`;
      column.style.gap = `${startGap + (targetGap - startGap) * eased}px`;
      white.style.opacity = String(startWhiteOpacity + (targetWhiteOpacity - startWhiteOpacity) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      colored.style.height = `${targetColored}px`;
      white.style.height = `${targetWhite}px`;
      column.style.gap = `${targetGap}px`;
      white.style.opacity = String(targetWhiteOpacity);
      colored.style.transition = "";
      white.style.transition = "";
      column.style.transition = "";
      animationRef.current = null;
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [coloredRef, columnRef, isExchange, isSafari, whiteRef]);
}
