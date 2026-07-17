"use client";

import { httpRequest } from "./http";

export type ApiListingCondition =
  | "excellent"
  | "new"
  | "good"
  | "used"
  | "needs_repair"
  | "service";

export type ApiListingCard = {
  id: string;
  status: "draft" | "active" | "archived";
  type: "item" | "service";
  title: string;
  wantsText: string;
  wantsTags: string[];
  condition: ApiListingCondition;
  extraPay: "none" | "i_pay" | "they_pay";
  hasDocuments: boolean;
  isFree: boolean;
  estimatedPrice: number | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  wantsCategory: { id: string; name: string; slug: string } | null;
  city: { id: string; name: string; regionName: string | null; slug: string };
  coverImageUrl: string | null;
  isFavorite: boolean;
};

export type ApiListResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

export type ListingsQuery = {
  page?: number;
  pageSize?: number;
  query?: string;
  searchMode?: "have" | "want";
  cityId?: string;
  citySlug?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryUiKey?: string;
  publishedRange?: "today" | "week" | "month" | "year";
  hasDocuments?: boolean;
  hasExtraPay?: boolean;
  isFree?: boolean;
  condition?: ApiListingCondition[];
  type?: Array<"item" | "service">;
  priceFrom?: number;
  priceTo?: number;
  verifiedProvider?: boolean;
  serviceFormats?: Array<"online" | "onsite" | "client">;
};

export type RecommendationsQuery = {
  limit?: number;
  categoryId?: string;
  categoryUiKey?: string;
  cityId?: string;
  query?: string;
  hasDocuments?: boolean;
  condition?: ApiListingCondition[];
  priceFrom?: number;
  priceTo?: number;
};

export function getListings(query: ListingsQuery, signal?: AbortSignal) {
  return httpRequest<ApiListResponse<ApiListingCard>>("/listings", {
    query,
    signal,
  });
}

export function getRecommendations(query: RecommendationsQuery, signal?: AbortSignal) {
  return httpRequest<ApiListResponse<ApiListingCard>>("/listings/recommendations", {
    query,
    signal,
  });
}
