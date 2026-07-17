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
): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => updateFavoriteItem(item, listingId, isFavorite));
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  const record = data as Record<string, unknown>;
  if (Array.isArray(record.data)) {
    return {
      ...record,
      data: record.data.map((item) => updateFavoriteItem(item, listingId, isFavorite)),
    };
  }

  if (Array.isArray(record.items)) {
    return {
      ...record,
      items: record.items.map((item) => updateFavoriteItem(item, listingId, isFavorite)),
    };
  }

  return data;
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
        { queryKey: listingQueryKeys.all },
        (data) => updateFavoriteInQueryData(data, variables.listingId, nextFavorite),
      );
      await queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
    },
  });
}
