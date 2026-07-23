import type { ConditionOptionId } from "@/entities/listing";

export type HomeSearchMode = "exchange" | "browse";

export type DateOptionId = "all" | "today" | "week" | "month" | "year";

export type ListingMode = "item" | "service";
export type SearchMode = "have" | "want";

export type ServiceFormatId = "online" | "onsite" | "client";

export type HomeFiltersState = {
  searchMode: SearchMode;
  listingMode: ListingMode;
  categoryParentId: string;
  categoryChildId: string;
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
  categoryId: string;
  title: string;
  price: string;
  city: string;
  hasDocuments: boolean;
  condition: string;
};

export type HomeCategoryItem = {
  id: string;
  label: string;
  iconUrl: string | null;
  homeArcOrder?: number;
  isVirtual?: boolean;
};

export const DEFAULT_HERO_CONDITION = "";

export function createDefaultFilters(): HomeFiltersState {
  return {
    searchMode: "want",
    listingMode: "item",
    categoryParentId: "",
    categoryChildId: "",
    city: "",
    priceFrom: "",
    priceTo: "",
    datePeriod: "all",
    conditions: [],
    withSurcharge: false,
    withDocuments: false,
    serviceFormats: [],
    verifiedProvider: false,
    titleQuery: "",
  };
}

export type { ConditionOptionId } from "@/entities/listing";
