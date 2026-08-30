import type { ListingsQuery, RecommendationsQuery } from "@/shared/api/listings";

export const listingQueryKeys = {
  all: ["listings"] as const,
  list: (query: ListingsQuery) => [...listingQueryKeys.all, "list", query] as const,
  recommendations: (query: RecommendationsQuery) =>
    [...listingQueryKeys.all, "recommendations", query] as const,
  detail: (listingId: string) => [...listingQueryKeys.all, "detail", listingId] as const,
  similar: (listingId: string, limit = 8) =>
    [...listingQueryKeys.all, "similar", listingId, limit] as const,
};
