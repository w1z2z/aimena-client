"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/http";
import { getListings, getRecommendations } from "@/shared/api/listings";

import { listingQueryKeys } from "@/entities/listing/api/query-keys";
import { mapApiListingToCard } from "@/entities/listing/model/mappers";
import type { ListingCardData } from "@/entities/listing/model/types";
import {
  mapConditionIdToBackend,
  mapConditionLabelToId,
} from "@/entities/listing/model/conditions";
import type { HomeHeroState } from "@/features/home-search/types";

const HERO_RECOMMENDATIONS_LIMIT = 5;
const HERO_RANDOM_POOL_SIZE = 24;

function parsePrice(value: string): number | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

type HeroRecommendationsParams = {
  hero: HomeHeroState;
  categoryUiKeyToBackendId: Record<string, string>;
  enabled?: boolean;
};

export function useHeroRecommendations({
  hero,
  categoryUiKeyToBackendId,
  enabled = true,
}: HeroRecommendationsParams) {
  return useQuery({
    queryKey: [...listingQueryKeys.all, "hero-recommendations", hero, categoryUiKeyToBackendId],
    enabled,
    queryFn: async ({ signal }) => {
      const isAllCategory = hero.categoryId === "all";
      const categoryBackendId = isAllCategory
        ? undefined
        : categoryUiKeyToBackendId[hero.categoryId];
      const cityId = hero.city || undefined;
      const parsedPrice = parsePrice(hero.price);
      const conditionId = mapConditionLabelToId(hero.condition);
      const backendCondition =
        hero.mode === "browse" && conditionId
          ? mapConditionIdToBackend(conditionId)
          : undefined;

      const sharedFilters = {
        cityId,
        query: hero.title.trim() || undefined,
        hasDocuments: hero.mode === "browse" && hero.hasDocuments ? true : undefined,
        condition: backendCondition ? [backendCondition] : undefined,
        approximatePrice: parsedPrice,
      };

      const categoryFilters = isAllCategory
        ? {}
        : {
            categoryId: categoryBackendId,
            categoryUiKey: hero.categoryId,
          };

      const fetchListingsFeed = (searchMode: "have" | "want", pageSize: number) =>
        getListings(
          {
            page: 1,
            pageSize,
            type: ["item"],
            searchMode,
            ...sharedFilters,
            ...categoryFilters,
          },
          signal,
        );

      if (isAllCategory) {
        const response = await fetchListingsFeed(
          hero.mode === "exchange" ? "have" : "want",
          HERO_RANDOM_POOL_SIZE,
        );
        return shuffleItems(response.data.map(mapApiListingToCard)).slice(
          0,
          HERO_RECOMMENDATIONS_LIMIT,
        );
      }

      if (hero.mode === "exchange") {
        try {
          const response = await getRecommendations(
            {
              limit: HERO_RECOMMENDATIONS_LIMIT,
              ...sharedFilters,
              ...categoryFilters,
            },
            signal,
          );
          return response.data.map(mapApiListingToCard);
        } catch (requestError) {
          if (requestError instanceof ApiError && requestError.status === 404) {
            const response = await fetchListingsFeed("have", HERO_RECOMMENDATIONS_LIMIT);
            return response.data.map(mapApiListingToCard);
          }
          throw requestError;
        }
      }

      const response = await fetchListingsFeed("want", HERO_RECOMMENDATIONS_LIMIT);
      return response.data.map(mapApiListingToCard);
    },
    placeholderData: (previous) => previous,
  });
}

type FilteredListingsParams = {
  appliedFilters: import("@/features/home-search/types").HomeFiltersState;
  categoryUiKeyToBackendId: Record<string, string>;
  enabled?: boolean;
};

export function useFilteredListings({
  appliedFilters,
  categoryUiKeyToBackendId,
  enabled = true,
}: FilteredListingsParams) {
  return useQuery({
    queryKey: [...listingQueryKeys.all, "filtered", appliedFilters, categoryUiKeyToBackendId],
    enabled,
    queryFn: async ({ signal }) => {
      const cityId = appliedFilters.city || undefined;
      const categoryId = categoryUiKeyToBackendId[appliedFilters.category];
      const mappedConditions = appliedFilters.conditions
        .map((conditionId) => mapConditionIdToBackend(conditionId))
        .filter((value): value is NonNullable<typeof value> => Boolean(value));
      const approximatePrice = parsePrice(appliedFilters.approximatePrice);
      const priceFrom = approximatePrice ? undefined : parsePrice(appliedFilters.priceFrom);
      const priceTo = approximatePrice ? undefined : parsePrice(appliedFilters.priceTo);

      try {
        const response = await getListings(
          {
            page: 1,
            pageSize: 24,
            query: appliedFilters.titleQuery.trim() || undefined,
            searchMode: appliedFilters.searchMode,
            cityId,
            categoryId,
            categoryUiKey:
              appliedFilters.category && appliedFilters.category !== "all"
                ? appliedFilters.category
                : undefined,
            type: [appliedFilters.listingMode],
            publishedRange:
              appliedFilters.datePeriod === "all" ? undefined : appliedFilters.datePeriod,
            hasDocuments: appliedFilters.withDocuments ? true : undefined,
            hasExtraPay: appliedFilters.withSurcharge ? true : undefined,
            condition: mappedConditions.length > 0 ? mappedConditions : undefined,
            verifiedProvider: appliedFilters.verifiedProvider ? true : undefined,
            serviceFormats:
              appliedFilters.listingMode === "service" && appliedFilters.serviceFormats.length > 0
                ? appliedFilters.serviceFormats
                : undefined,
            approximatePrice,
            priceFrom,
            priceTo,
          },
          signal,
        );

        return {
          items: response.data.map(mapApiListingToCard) as ListingCardData[],
          total: response.meta.total,
        };
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 404) {
          return { items: [], total: 0 };
        }
        throw requestError;
      }
    },
    placeholderData: (previous) => previous,
  });
}
