export type HomeSearchMode = "exchange" | "browse";

export type ConditionOptionId = "excellent" | "new" | "good" | "used" | "repair";

export type DateOptionId = "all" | "today" | "week" | "month" | "year";

export type ListingMode = "item" | "service";
export type SearchMode = "have" | "want";

export type ServiceFormatId = "online" | "onsite" | "client";

export type HomeFiltersState = {
  searchMode: SearchMode;
  listingMode: ListingMode;
  category: string;
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

export type HomeListingCard = {
  id: string;
  title: string;
  city: string;
  condition: string;
  wants: string[];
  wantsMore: number;
  hasDocuments: boolean;
  isFree: boolean;
  price: number;
  coverImageUrl: string | null;
};

export type HomeCategoryItem = {
  id: string;
  label: string;
  iconUrl: string | null;
  homeArcOrder?: number;
  isVirtual?: boolean;
};

export const DEFAULT_HERO_CONDITION = "";

export const HERO_CONDITION_OPTIONS = [
  "Отличное",
  "Новое",
  "Хорошее",
  "Б.у",
  "Требует ремонта",
] as const;

export function createDefaultFilters(): HomeFiltersState {
  return {
    searchMode: "want",
    listingMode: "item",
    category: "all",
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
