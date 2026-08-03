"use client";

import { httpRequest } from "./http";

export type ApiCategoryForType = "item" | "service";

export type ApiCategoryNode = {
  id: string;
  name: string;
  shortName?: string | null;
  slug: string;
  forType?: ApiCategoryForType;
  uiKey?: string;
  iconUrl?: string | null;
  homeArcOrder?: number;
  isVirtual?: boolean;
  children?: Array<{
    id: string;
    name: string;
    shortName?: string | null;
    slug: string;
    forType?: ApiCategoryForType;
  }>;
};

export type ApiCategoriesResponse = {
  data: ApiCategoryNode[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

export type ApiCity = {
  id: string;
  name: string;
  regionName: string | null;
  slug: string;
};

export type ApiCitiesResponse = {
  data: {
    featured: ApiCity[];
    cities: ApiCity[];
  };
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

export function getCategories(params?: {
  parentsOnly?: boolean;
  homeArc?: boolean;
  forType?: ApiCategoryForType;
}) {
  return httpRequest<ApiCategoriesResponse>("/categories", {
    query: {
      parentsOnly: params?.parentsOnly,
      homeArc: params?.homeArc,
      forType: params?.forType,
    },
  });
}

export function getCities(params?: { q?: string; page?: number; pageSize?: number }) {
  return httpRequest<ApiCitiesResponse>("/cities", {
    query: {
      q: params?.q,
      page: params?.page,
      pageSize: params?.pageSize,
    },
  });
}
