"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { getListings, type ListingsQuery } from "@/shared/api/listings";

import { listingQueryKeys } from "../api/query-keys";
import { excludeOwnListings } from "../model/exclude-own";
import { mapApiListingToCard } from "../model/mappers";
import type { ListingCardData } from "../model/types";

type UseListingsOptions = {
  enabled?: boolean;
};

export function useListings(query: ListingsQuery, options: UseListingsOptions = {}) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: [...listingQueryKeys.list(query), user?.id ?? "anon"],
    queryFn: ({ signal }) => getListings(query, signal),
    enabled: (options.enabled ?? true) && !isLoading,
    select: (response) => ({
      items: excludeOwnListings(response.data.map(mapApiListingToCard), user?.id),
      total: response.meta.total,
    }),
  });
}

export function useFreeListings(limit = 8) {
  const query = useListings({
    page: 1,
    pageSize: 36,
    type: ["item"],
    isFree: true,
  });

  const items: ListingCardData[] = (query.data?.items ?? []).slice(0, limit);

  return {
    ...query,
    items,
  };
}
