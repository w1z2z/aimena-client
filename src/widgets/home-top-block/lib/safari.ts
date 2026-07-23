import { useSyncExternalStore } from "react";

function isSafariBrowser() {
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
