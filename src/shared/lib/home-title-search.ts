const STORAGE_KEY = "aimena.home-title-search";
const EVENT_NAME = "aimena:home-title-search";

export function requestHomeTitleSearch(title: string) {
  if (typeof window === "undefined") return;
  const trimmed = title.trim();
  if (!trimmed) return;

  window.sessionStorage.setItem(STORAGE_KEY, trimmed);
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { title: trimmed },
    }),
  );
}

export function peekHomeTitleSearch(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function consumeHomeTitleSearch(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  if (value) window.sessionStorage.removeItem(STORAGE_KEY);
  return value;
}

export function onHomeTitleSearch(handler: (title: string) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ title?: string }>).detail;
    const title = detail?.title?.trim();
    if (title) handler(title);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
