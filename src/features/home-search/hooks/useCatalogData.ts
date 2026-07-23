"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories, type ApiCategoryNode } from "@/shared/api/catalog";

import type { HomeCategoryItem } from "../types";

export type HomeCategoryTreeNode = ApiCategoryNode & {
  children?: Array<{ id: string; name: string; shortName?: string | null; slug: string }>;
};

export function useCatalogData() {
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "home-arc"],
    queryFn: () => getCategories({ homeArc: true }),
    staleTime: 5 * 60_000,
  });

  const categoryTreeQuery = useQuery({
    queryKey: ["catalog", "categories", "tree"],
    queryFn: () => getCategories({ parentsOnly: false, homeArc: false }),
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

  const categoryTree: HomeCategoryTreeNode[] = (categoryTreeQuery.data?.data ??
    []) as HomeCategoryTreeNode[];

  const categoryUiKeyToBackendId: Record<string, string> = {};
  for (const item of categoriesQuery.data?.data ?? []) {
    if (item.uiKey && !item.isVirtual) {
      categoryUiKeyToBackendId[item.uiKey] = item.id;
    }
  }

  return {
    categories,
    categoryTree,
    categoryUiKeyToBackendId,
    isLoading: categoriesQuery.isLoading || categoryTreeQuery.isLoading,
  };
}
