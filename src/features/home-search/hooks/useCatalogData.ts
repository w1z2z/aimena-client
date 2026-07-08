"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories, getCities } from "@/shared/api/catalog";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import type { SelectOption } from "@/shared/ui/select-field";

import type { HomeCategoryItem } from "../types";

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

export function useCatalogData() {
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "home-arc"],
    queryFn: () => getCategories({ homeArc: true }),
    staleTime: 5 * 60_000,
  });

  const citiesQuery = useQuery({
    queryKey: ["catalog", "cities"],
    queryFn: () => getCities({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60_000,
  });

  const categories: HomeCategoryItem[] =
    categoriesQuery.data?.data
      .map((item) => ({
        id: item.uiKey || item.slug || item.id,
        label: item.name.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim(),
        iconUrl: item.iconUrl ?? null,
        homeArcOrder: item.homeArcOrder,
        isVirtual: item.isVirtual,
      }))
      .sort(
        (left, right) =>
          (left.homeArcOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.homeArcOrder ?? Number.MAX_SAFE_INTEGER),
      ) ?? [];

  const categoryUiKeyToBackendId: Record<string, string> = {};
  for (const item of categoriesQuery.data?.data ?? []) {
    if (item.uiKey && !item.isVirtual) {
      categoryUiKeyToBackendId[item.uiKey] = item.id;
    }
  }

  const cityNameToId: Record<string, string> = {};
  const allCities = [
    ...(citiesQuery.data?.data.featured ?? []),
    ...(citiesQuery.data?.data.cities ?? []),
  ];

  for (const cityItem of allCities) {
    const name = cityItem.name.trim();
    if (!name) continue;

    const cityKey = normalizeLookupKey(name);
    if (!cityNameToId[cityKey]) {
      cityNameToId[cityKey] = cityItem.id;
    }
  }

  const cityOptions: SelectOption[] = citiesQuery.data
    ? buildCitySelectOptions({
        featured: citiesQuery.data.data.featured,
        cities: citiesQuery.data.data.cities,
        mapCityToOption: (cityItem) => ({
          value: cityItem.name.trim(),
          label: cityItem.name.trim(),
        }),
      })
    : [];

  return {
    categories,
    categoryUiKeyToBackendId,
    cityNameToId,
    cityOptions,
    isLoading: categoriesQuery.isLoading || citiesQuery.isLoading,
  };
}
