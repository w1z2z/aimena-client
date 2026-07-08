import type { ListingsQuery, RecommendationsQuery } from "@/shared/api/listings";

export const listingQueryKeys = {
  all: ["listings"] as const,
  list: (query: ListingsQuery) => [...listingQueryKeys.all, "list", query] as const,
  recommendations: (query: RecommendationsQuery) =>
    [...listingQueryKeys.all, "recommendations", query] as const,
};
