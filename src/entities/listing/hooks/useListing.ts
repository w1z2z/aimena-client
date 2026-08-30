"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { getListing, getSimilarListings } from "@/shared/api/listings";

import { listingQueryKeys } from "../api/query-keys";
import { excludeOwnListings } from "../model/exclude-own";

export function useListing(listingId: string) {
  return useQuery({
    queryKey: listingQueryKeys.detail(listingId),
    queryFn: ({ signal }) => getListing(listingId, signal),
    enabled: Boolean(listingId),
  });
}

export function useSimilarListings(listingId: string, limit = 8) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: [...listingQueryKeys.similar(listingId, limit), user?.id ?? "anon"],
    queryFn: async ({ signal }) => {
      const response = await getSimilarListings(listingId, { limit }, signal);
      return {
        ...response,
        data: excludeOwnListings(response.data, user?.id).slice(0, limit),
      };
    },
    enabled: Boolean(listingId) && !isLoading,
  });
}
