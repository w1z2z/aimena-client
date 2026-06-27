"use client";

import { httpRequest } from "./http";

export type ApiCategoryNode = {
  id: string;
  name: string;
  slug: string;
  uiKey?: string;
  iconUrl?: string | null;
  homeArcOrder?: number;
  isVirtual?: boolean;
  children?: Array<{ id: string; name: string; slug: string }>;
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

export function getCategories(params?: { parentsOnly?: boolean; homeArc?: boolean }) {
  return httpRequest<ApiCategoriesResponse>("/categories", {
    query: { parentsOnly: params?.parentsOnly, homeArc: params?.homeArc },
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
