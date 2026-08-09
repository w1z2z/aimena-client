const STORAGE_KEY = "aimena.home-open-filters";
const EVENT_NAME = "aimena:home-open-filters";

export type OpenHomeFiltersPayload = {
  categoryParentId?: string;
  categoryChildId?: string;
  searchMode?: "have" | "want";
  listingMode?: "item" | "service";
};

function writePayload(payload?: OpenHomeFiltersPayload) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload ?? {}));
}

function readPayload(): OpenHomeFiltersPayload | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw) as OpenHomeFiltersPayload;
  } catch {
    return {};
  }
}

export function requestOpenHomeFilters(payload?: OpenHomeFiltersPayload) {
  if (typeof window === "undefined") return;
  writePayload(payload);
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: payload ?? {},
    }),
  );
}

export function consumeOpenHomeFilters(): OpenHomeFiltersPayload | null {
  if (typeof window === "undefined") return null;
  return readPayload();
}

export function onOpenHomeFilters(handler: (payload: OpenHomeFiltersPayload) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<OpenHomeFiltersPayload>).detail;
    handler(detail ?? {});
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
