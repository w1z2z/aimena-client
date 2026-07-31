"use client";

import { useQuery } from "@tanstack/react-query";

import { getListing, getSimilarListings } from "@/shared/api/listings";

import { listingQueryKeys } from "../api/query-keys";

export function useListing(listingId: string) {
  return useQuery({
    queryKey: listingQueryKeys.detail(listingId),
    queryFn: ({ signal }) => getListing(listingId, signal),
    enabled: Boolean(listingId),
  });
}

export function useSimilarListings(listingId: string, limit = 12) {
  return useQuery({
    queryKey: listingQueryKeys.similar(listingId, limit),
    queryFn: ({ signal }) => getSimilarListings(listingId, { limit }, signal),
    enabled: Boolean(listingId),
  });
}
