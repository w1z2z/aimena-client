"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/entities/listing/api/query-keys";
import { addFavorite, removeFavorite } from "@/shared/api/favorites";

type ToggleFavoriteInput = {
  listingId: string;
  isFavorite: boolean;
};

export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: (page = 1, pageSize = 24) =>
    [...favoriteQueryKeys.all, "list", { page, pageSize }] as const,
};

function updateFavoriteItem(item: unknown, listingId: string, isFavorite: boolean) {
  if (!item || typeof item !== "object") {
    return item;
  }

  const record = item as Record<string, unknown>;
  return record.id === listingId ? { ...record, isFavorite } : item;
}

function updateFavoriteInQueryData(
  data: unknown,
  listingId: string,
  isFavorite: boolean,
  options?: { removeFromList?: boolean },
): unknown {
  if (Array.isArray(data)) {
    const mapped = data.map((item) => updateFavoriteItem(item, listingId, isFavorite));
    if (options?.removeFromList && !isFavorite) {
      return mapped.filter((item) => {
        if (!item || typeof item !== "object") return true;
        return (item as Record<string, unknown>).id !== listingId;
      });
    }
    return mapped;
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  const record = data as Record<string, unknown>;

  // useInfiniteQuery: { pages: [{ items | data: [...] }], pageParams }
  if (Array.isArray(record.pages)) {
    return {
      ...record,
      pages: record.pages.map((page) =>
        updateFavoriteInQueryData(page, listingId, isFavorite, options),
      ),
    };
  }

  if (Array.isArray(record.data)) {
    const nextData = record.data.map((item) =>
      updateFavoriteItem(item, listingId, isFavorite),
    );
    return {
      ...record,
      data:
        options?.removeFromList && !isFavorite
          ? nextData.filter((item) => {
              if (!item || typeof item !== "object") return true;
              return (item as Record<string, unknown>).id !== listingId;
            })
          : nextData,
      meta:
        options?.removeFromList &&
        !isFavorite &&
        record.meta &&
        typeof record.meta === "object"
          ? {
              ...(record.meta as Record<string, unknown>),
              total: Math.max(
                0,
                Number((record.meta as Record<string, unknown>).total ?? 0) - 1,
              ),
            }
          : record.meta,
    };
  }

  if (Array.isArray(record.items)) {
    return {
      ...record,
      items: record.items.map((item) => updateFavoriteItem(item, listingId, isFavorite)),
    };
  }

  // Detail response: { listing: { id, isFavorite, ... } }
  if (record.listing && typeof record.listing === "object") {
    return {
      ...record,
      listing: updateFavoriteItem(record.listing, listingId, isFavorite),
    };
  }

  return data;
}

function isListingFavoriteQuery(queryKey: readonly unknown[]) {
  const root = queryKey[0];
  return (
    root === listingQueryKeys.all[0] ||
    root === favoriteQueryKeys.all[0] ||
    root === "profile-listings-me"
  );
}

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: ToggleFavoriteInput) => {
      if (isFavorite) {
        await removeFavorite(listingId);
        return;
      }

      await addFavorite(listingId);
    },
    onSuccess: async (_data, variables) => {
      const nextFavorite = !variables.isFavorite;
      queryClient.setQueriesData(
        {
          predicate: (query) =>
            isListingFavoriteQuery(query.queryKey) &&
            query.queryKey[0] !== favoriteQueryKeys.all[0],
        },
        (data) => updateFavoriteInQueryData(data, variables.listingId, nextFavorite),
      );
      queryClient.setQueriesData(
        { queryKey: favoriteQueryKeys.all },
        (data) =>
          updateFavoriteInQueryData(data, variables.listingId, nextFavorite, {
            removeFromList: true,
          }),
      );
      await queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
    },
  });
}
