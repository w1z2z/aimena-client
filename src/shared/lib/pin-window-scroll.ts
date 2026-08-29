/** Keep layout scroll position — iOS Safari jumps/zooms the page when focusing fields. */
export function pinWindowScroll(scrollX: number, scrollY: number) {
  if (Math.abs(window.scrollX - scrollX) > 0.5 || Math.abs(window.scrollY - scrollY) > 0.5) {
    window.scrollTo(scrollX, scrollY);
  }
}

/** Pin across keyboard / focus-scroll delays (same as onboarding city select). */
export function pinScrollAroundFocus() {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const pin = () => {
    pinWindowScroll(scrollX, scrollY);
  };

  pin();
  window.requestAnimationFrame(() => {
    pin();
    window.requestAnimationFrame(pin);
  });
  for (const delay of [50, 100, 200, 280, 360]) {
    window.setTimeout(pin, delay);
  }
}
