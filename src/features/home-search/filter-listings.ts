import { CONDITION_LABEL_TO_ID } from "@/entities/listing";
import type { HomeFiltersState, HomeHeroState } from "./types";

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return Number.parseInt(digits, 10);
}

export function heroToFilters(hero: HomeHeroState): HomeFiltersState {
  const price = parsePrice(hero.price);
  const conditionKey = CONDITION_LABEL_TO_ID[hero.condition];

  return {
    searchMode: hero.mode === "exchange" ? "have" : "want",
    listingMode: "item",
    category: hero.categoryId,
    city: hero.city,
    priceFrom: "",
    priceTo: "",
    approximatePrice: price !== null ? String(price) : "",
    datePeriod: "all",
    conditions: hero.mode === "browse" && conditionKey ? [conditionKey] : [],
    withSurcharge: false,
    withDocuments: hero.mode === "browse" ? hero.hasDocuments : false,
    serviceFormats: [],
    verifiedProvider: false,
    titleQuery: hero.title,
  };
}
