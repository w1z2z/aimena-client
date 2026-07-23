"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/shared/api/catalog";

import type { HomeCategoryItem } from "../types";

export function useCatalogData() {
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "home-arc"],
    queryFn: () => getCategories({ homeArc: true }),
    staleTime: 5 * 60_000,
  });

  const categories: HomeCategoryItem[] = (categoriesQuery.data?.data ?? [])
    .filter((item) => Boolean(item.uiKey))
    .map((item) => ({
      id: item.uiKey as string,
      label: item.shortName || item.name,
      iconUrl: item.iconUrl ?? null,
      homeArcOrder: item.homeArcOrder,
      isVirtual: item.isVirtual,
    }))
    .sort(
      (left, right) =>
        (left.homeArcOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.homeArcOrder ?? Number.MAX_SAFE_INTEGER),
    );

  const categoryUiKeyToBackendId: Record<string, string> = {};
  for (const item of categoriesQuery.data?.data ?? []) {
    if (item.uiKey && !item.isVirtual) {
      categoryUiKeyToBackendId[item.uiKey] = item.id;
    }
  }

  return {
    categories,
    categoryUiKeyToBackendId,
    isLoading: categoriesQuery.isLoading,
  };
}
