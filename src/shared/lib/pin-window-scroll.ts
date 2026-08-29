/** Keep layout scroll position — iOS Safari jumps when focusing fields. */
export function pinWindowScroll(scrollX: number, scrollY: number) {
  if (Math.abs(window.scrollX - scrollX) > 0.5 || Math.abs(window.scrollY - scrollY) > 0.5) {
    window.scrollTo(scrollX, scrollY);
  }

  const docTop = document.documentElement.scrollTop;
  const bodyTop = document.body.scrollTop;
  if (Math.abs(docTop - scrollY) > 0.5) {
    document.documentElement.scrollTop = scrollY;
  }
  if (Math.abs(bodyTop - scrollY) > 0.5) {
    document.body.scrollTop = scrollY;
  }
}

let activePinCleanup: (() => void) | null = null;

/** Pin across keyboard / focus-scroll delays (iOS may scroll late). */
export function pinScrollAroundFocus(durationMs = 1000) {
  if (typeof window === "undefined") return;

  activePinCleanup?.();

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const pin = () => {
    pinWindowScroll(scrollX, scrollY);
  };

  const onScroll = () => {
    pin();
  };

  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  const viewport = window.visualViewport;
  viewport?.addEventListener("scroll", onScroll);
  viewport?.addEventListener("resize", onScroll);

  pin();
  window.requestAnimationFrame(() => {
    pin();
    window.requestAnimationFrame(pin);
  });

  const timeouts = [16, 50, 100, 150, 200, 280, 360, 450, 600, 750, 900, 1000].map((delay) =>
    window.setTimeout(pin, delay),
  );

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll, { capture: true });
    viewport?.removeEventListener("scroll", onScroll);
    viewport?.removeEventListener("resize", onScroll);
    timeouts.forEach((id) => window.clearTimeout(id));
    if (activePinCleanup === cleanup) {
      activePinCleanup = null;
    }
  };

  activePinCleanup = cleanup;
  window.setTimeout(cleanup, durationMs);
}
