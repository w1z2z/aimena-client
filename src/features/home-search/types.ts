import type { CategoryId } from "@/shared/ui/icons/category-icons";

export type HomeSearchMode = "exchange" | "browse";

export type ConditionOptionId = "excellent" | "new" | "good" | "used" | "repair";

export type DateOptionId = "today" | "week" | "month" | "year";

export type ListingMode = "item" | "service";

export type ServiceFormatId = "online" | "onsite" | "client";

export type HomeFiltersState = {
  listingMode: ListingMode;
  category: CategoryId;
  city: string;
  priceFrom: string;
  priceTo: string;
  datePeriod: DateOptionId;
  conditions: ConditionOptionId[];
  withSurcharge: boolean;
  withDocuments: boolean;
  serviceFormats: ServiceFormatId[];
  verifiedProvider: boolean;
  titleQuery: string;
};

export type HomeHeroState = {
  mode: HomeSearchMode;
  categoryId: CategoryId;
  title: string;
  price: string;
  city: string;
  hasDocuments: boolean;
  condition: string;
};

export const DEFAULT_HERO_CONDITION = "Отличное";

export const HERO_CONDITION_OPTIONS = [
  "Отличное",
  "Новое",
  "Хорошее",
  "Б.у",
  "Требует ремонта",
] as const;

export function createDefaultFilters(): HomeFiltersState {
  return {
    listingMode: "item",
    category: "all",
    city: "",
    priceFrom: "",
    priceTo: "",
    datePeriod: "today",
    conditions: [],
    withSurcharge: false,
    withDocuments: false,
    serviceFormats: [],
    verifiedProvider: false,
    titleQuery: "",
  };
}
