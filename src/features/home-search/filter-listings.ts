import type { CategoryId } from "@/shared/ui/icons/category-icons";

import { CONDITION_ID_TO_LABEL, CONDITION_LABEL_TO_ID } from "./constants";
import type { MockListing } from "./mock-listings";
import type { HomeFiltersState, HomeHeroState } from "./types";

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return Number.parseInt(digits, 10);
}

function matchesCity(listing: MockListing, city: string) {
  if (!city.trim()) return true;
  return listing.city.toLowerCase().includes(city.trim().toLowerCase());
}

function matchesTitle(listing: MockListing, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    listing.title.toLowerCase().includes(normalized) ||
    listing.wants.some((item) => item.toLowerCase().includes(normalized))
  );
}

function matchesCategory(listing: MockListing, categoryId: CategoryId) {
  if (categoryId === "all") return true;
  return listing.categoryId === categoryId;
}

function matchesConditions(listing: MockListing, conditions: HomeFiltersState["conditions"]) {
  if (conditions.length === 0) return true;
  return conditions.some((id) => listing.condition === CONDITION_ID_TO_LABEL[id]);
}

function matchesDocuments(listing: MockListing, withDocuments: boolean) {
  if (!withDocuments) return true;
  return listing.hasDocuments;
}

function matchesPrice(listing: MockListing, priceFrom: string, priceTo: string) {
  const from = parsePrice(priceFrom);
  const to = parsePrice(priceTo);
  if (from !== null && listing.price < from) return false;
  if (to !== null && listing.price > to) return false;
  return true;
}

export function filterListingsByFilters(
  listings: MockListing[],
  filters: HomeFiltersState,
): MockListing[] {
  return listings.filter(
    (listing) =>
      matchesCategory(listing, filters.category) &&
      matchesCity(listing, filters.city) &&
      matchesTitle(listing, filters.titleQuery) &&
      matchesConditions(listing, filters.conditions) &&
      matchesDocuments(listing, filters.withDocuments) &&
      matchesPrice(listing, filters.priceFrom, filters.priceTo),
  );
}

export function scoreListingForHero(listing: MockListing, hero: HomeHeroState) {
  let score = 0;

  if (matchesCategory(listing, hero.categoryId)) score += 4;
  if (matchesCity(listing, hero.city)) score += 3;
  if (matchesTitle(listing, hero.title)) score += 5;
  if (hero.mode === "browse" && hero.condition && listing.condition === hero.condition) score += 2;
  if (hero.mode === "browse" && hero.hasDocuments && listing.hasDocuments) score += 1;

  const heroPrice = parsePrice(hero.price);
  if (heroPrice !== null) {
    const delta = Math.abs(listing.price - heroPrice) / heroPrice;
    if (delta <= 0.35) score += 2;
  }

  return score;
}

export function getHeroRecommendations(listings: MockListing[], hero: HomeHeroState, limit = 5) {
  const pool =
    hero.categoryId === "all"
      ? listings
      : listings.filter((listing) => listing.categoryId === hero.categoryId);

  const ranked = [...pool]
    .map((listing) => ({ listing, score: scoreListingForHero(listing, hero) }))
    .sort((left, right) => right.score - left.score || left.listing.id - right.listing.id);

  const withMatches = ranked.filter((item) => item.score > 0).map((item) => item.listing);
  if (withMatches.length >= limit) return withMatches.slice(0, limit);

  const fallback = ranked.map((item) => item.listing);
  return fallback.slice(0, limit);
}

export function heroToFilters(hero: HomeHeroState): HomeFiltersState {
  const price = parsePrice(hero.price);
  const conditionKey = CONDITION_LABEL_TO_ID[hero.condition];

  return {
    listingMode: "item",
    category: hero.categoryId,
    city: hero.city,
    priceFrom: price !== null ? String(Math.round(price * 0.75)) : "",
    priceTo: price !== null ? String(price) : "",
    datePeriod: "today",
    conditions: hero.mode === "browse" && conditionKey ? [conditionKey] : [],
    withSurcharge: false,
    withDocuments: hero.mode === "browse" ? hero.hasDocuments : false,
    serviceFormats: [],
    verifiedProvider: false,
    titleQuery: hero.title,
  };
}
