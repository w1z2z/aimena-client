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
  ownerId: string;
  status: "draft" | "active" | "archived";
  type: "item" | "service";
  title: string;
  wantsText: string;
  wantsTags: string[];
  condition: ApiListingCondition;
  extraPay: "none" | "i_pay" | "they_pay" | "both";
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
  isAvailable?: boolean;
};

export type ApiListingImage = {
  id: string;
  mediaId: string;
  kind: "item" | "document";
  url: string;
  sortOrder: number;
  isCover: boolean;
};

export type ApiListingOwner = {
  id: string;
  displayName: string;
  slug: string;
  avatarUrl: string | null;
  verified: boolean;
  swapsCount: number;
  ratingAvg: number;
  ratingCount: number;
};

export type ApiListingDetail = {
  id: string;
  status: "draft" | "active" | "archived";
  type: "item" | "service";
  serviceFormats: Array<"online" | "onsite" | "client" | "offline">;
  title: string;
  description: string;
  condition: ApiListingCondition;
  estimatedPrice: number | null;
  extraPay: "none" | "i_pay" | "they_pay" | "both";
  isFree: boolean;
  hasDocuments: boolean;
  wantsText: string;
  wantsTags: string[];
  category: { id: string; name: string; slug: string };
  wantsCategory: { id: string; name: string; slug: string } | null;
  city: { id: string; name: string; regionName: string | null; slug: string };
  owner: ApiListingOwner | null;
  images: ApiListingImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  isFavorite: boolean;
};

export type ApiListingDetailResponse = {
  listing: ApiListingDetail;
};

export type ApiListResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
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
  approximatePrice?: number;
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
  approximatePrice?: number;
};

export type TagSuggestionsResponse = {
  data: string[];
};

export type CreateListingPayload = {
  type: "item" | "service";
  serviceFormats?: Array<"online" | "offline" | "onsite">;
  title: string;
  description: string;
  categoryId: string;
  wantsCategoryId?: string | null;
  cityId: string;
  condition?: ApiListingCondition;
  estimatedPrice?: number | null;
  extraPay?: "none" | "i_pay" | "they_pay" | "both";
  isFree?: boolean;
  wantsTags?: string[];
  itemUploadIds?: string[];
  documentUploadIds?: string[];
};

export type CreateListingResponse = {
  listing: {
    id: string;
    status: "draft" | "active" | "archived";
  };
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

export function getListingTagSuggestions(
  params: { q?: string; limit?: number },
  signal?: AbortSignal,
) {
  return httpRequest<TagSuggestionsResponse>("/listings/tags/suggest", {
    query: params,
    signal,
  });
}

export function createListingDraft(payload: CreateListingPayload) {
  return httpRequest<CreateListingResponse>("/listings", {
    method: "POST",
    body: payload,
  });
}

export function getMyListings(
  query: {
    page?: number;
    pageSize?: number;
    status?: ApiListingCard["status"][];
    sort?: "newest" | "oldest";
  } = {},
  signal?: AbortSignal,
) {
  return httpRequest<ApiListResponse<ApiListingCard>>("/listings/me", {
    query,
    signal,
  });
}

export function publishListing(listingId: string) {
  return httpRequest<CreateListingResponse>(`/listings/${listingId}/publish`, {
    method: "POST",
  });
}

export function updateListing(listingId: string, payload: CreateListingPayload) {
  return httpRequest<ApiListingDetailResponse>(`/listings/${listingId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getListing(listingId: string, signal?: AbortSignal) {
  return httpRequest<ApiListingDetailResponse>(`/listings/${listingId}`, {
    signal,
  });
}

export function getSimilarListings(
  listingId: string,
  params: { limit?: number } = {},
  signal?: AbortSignal,
) {
  return httpRequest<ApiListResponse<ApiListingCard>>(`/listings/${listingId}/similar`, {
    query: params,
    signal,
  });
}

export function pauseListing(listingId: string) {
  return httpRequest<ApiListingDetailResponse>(`/listings/${listingId}/pause`, {
    method: "POST",
  });
}

export function deleteListing(listingId: string) {
  return httpRequest<ApiListingDetailResponse>(`/listings/${listingId}`, {
    method: "DELETE",
  });
}
