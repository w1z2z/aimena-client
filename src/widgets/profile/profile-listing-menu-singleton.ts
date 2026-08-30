let activeClose: (() => void) | null = null;

/** Only one profile listing actions menu may stay open at a time. */
export function claimProfileListingMenu(close: () => void) {
  if (activeClose && activeClose !== close) {
    activeClose();
  }
  activeClose = close;
}

export function releaseProfileListingMenu(close: () => void) {
  if (activeClose === close) {
    activeClose = null;
  }
}
