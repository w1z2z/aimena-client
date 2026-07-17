"use client";

import { httpRequest } from "./http";
import type { ApiListResponse, ApiListingCard } from "./listings";

export type FavoriteStateResponse = {
  listingId: string;
  isFavorite: boolean;
};

export type FavoritesQuery = {
  page?: number;
  pageSize?: number;
};

export function addFavorite(listingId: string) {
  return httpRequest<FavoriteStateResponse>(`/favorites/${listingId}`, {
    method: "POST",
  });
}

export function removeFavorite(listingId: string) {
  return httpRequest<void>(`/favorites/${listingId}`, {
    method: "DELETE",
  });
}

export function getFavorites(query: FavoritesQuery = {}, signal?: AbortSignal) {
  return httpRequest<ApiListResponse<ApiListingCard>>("/favorites/me", {
    query,
    signal,
  });
}
