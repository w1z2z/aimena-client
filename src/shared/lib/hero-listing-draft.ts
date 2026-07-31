const HERO_LISTING_DRAFT_KEY = "swaply-hero-listing-draft";

export type HeroListingDraft = {
  title: string;
  price: string;
  cityId: string;
  cityLabel: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readHeroListingDraft(): HeroListingDraft | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(HERO_LISTING_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<HeroListingDraft>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      price: typeof parsed.price === "string" ? parsed.price : "",
      cityId: typeof parsed.cityId === "string" ? parsed.cityId : "",
      cityLabel: typeof parsed.cityLabel === "string" ? parsed.cityLabel : "",
    };
  } catch {
    return null;
  }
}

export function writeHeroListingDraft(draft: HeroListingDraft) {
  if (!canUseStorage()) return;

  const next: HeroListingDraft = {
    title: draft.title.trim(),
    price: draft.price.replace(/\D/g, ""),
    cityId: draft.cityId.trim(),
    cityLabel: draft.cityLabel.trim(),
  };

  if (!next.title && !next.price && !next.cityId) {
    window.sessionStorage.removeItem(HERO_LISTING_DRAFT_KEY);
    return;
  }

  window.sessionStorage.setItem(HERO_LISTING_DRAFT_KEY, JSON.stringify(next));
}

export function clearHeroListingDraft() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(HERO_LISTING_DRAFT_KEY);
}
