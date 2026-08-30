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

/** Stop fighting page scroll after an accidental focus while swiping. */
export function cancelScrollPin() {
  activePinCleanup?.();
}

/** Pin across keyboard / focus-scroll delays (iOS may scroll late). */
export function pinScrollAroundFocus(durationMs = 1000) {
  if (typeof window === "undefined") return;

  activePinCleanup?.();

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const pin = () => {
    pinWindowScroll(scrollX, scrollY);
  };

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    window.removeEventListener("scroll", onScroll, { capture: true });
    viewport?.removeEventListener("scroll", onScroll);
    viewport?.removeEventListener("resize", onScroll);
    window.removeEventListener("wheel", onUserScrollIntent);
    window.removeEventListener("touchstart", onUserScrollIntent);
    window.removeEventListener("touchmove", onUserScrollIntent);
    timeouts.forEach((id) => window.clearTimeout(id));
    if (activePinCleanup === cleanup) {
      activePinCleanup = null;
    }
  };

  const onUserScrollIntent = () => {
    cleanup();
  };

  const onScroll = () => {
    if (Math.abs(window.scrollY - scrollY) > 2 || Math.abs(window.scrollX - scrollX) > 2) {
      cleanup();
    }
  };

  const viewport = window.visualViewport;
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  viewport?.addEventListener("scroll", onScroll);
  viewport?.addEventListener("resize", onScroll);
  window.addEventListener("wheel", onUserScrollIntent, { passive: true });
  window.addEventListener("touchstart", onUserScrollIntent, { passive: true });
  window.addEventListener("touchmove", onUserScrollIntent, { passive: true });

  pin();
  window.requestAnimationFrame(() => {
    pin();
    window.requestAnimationFrame(pin);
  });

  const timeouts = [16, 50, 100, 150, 200, 280, 360, 450, 600, 750, 900, 1000].map((delay) =>
    window.setTimeout(() => {
      if (!cleanedUp) pin();
    }, delay),
  );

  activePinCleanup = cleanup;
  window.setTimeout(cleanup, durationMs);
}
