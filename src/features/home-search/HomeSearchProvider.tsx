"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ListingCardData } from "@/entities/listing";

import { useCatalogData } from "./hooks/useCatalogData";
import { useFilteredListings, useHeroRecommendations } from "./hooks/useHomeListingsData";
import { heroToFilters } from "./filter-listings";
import {
  createDefaultFilters,
  DEFAULT_HERO_CONDITION,
  type HomeCategoryItem,
  type HomeFiltersState,
  type HomeHeroState,
  type HomeSearchMode,
} from "./types";

const FILTERS_AUTO_APPLY_DEBOUNCE_MS = 200;

type HomeSearchContextValue = {
  hero: HomeHeroState;
  setMode: (mode: HomeSearchMode) => void;
  setCategoryId: (categoryId: string) => void;
  setTitle: (title: string) => void;
  setPrice: (price: string) => void;
  setCity: (city: string) => void;
  setHasDocuments: (value: boolean | ((prev: boolean) => boolean)) => void;
  setCondition: (condition: string) => void;
  filters: HomeFiltersState;
  setFilters: (value: HomeFiltersState | ((prev: HomeFiltersState) => HomeFiltersState)) => void;
  appliedFilters: HomeFiltersState;
  resetFilters: () => void;
  applyFilters: () => void;
  applyHeroToFilters: () => void;
  openFiltersAndScroll: () => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  heroRecommendations: ListingCardData[];
  heroRecommendationsLoading: boolean;
  filteredListings: ListingCardData[];
  listingsCount: number;
  cityOptions: import("@/shared/ui/select-field").SelectOption[];
  categories: HomeCategoryItem[];
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HomeSearchMode>("exchange");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [hasDocuments, setHasDocuments] = useState(false);
  const [condition, setCondition] = useState(DEFAULT_HERO_CONDITION);
  const [filters, setFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { categories, categoryUiKeyToBackendId, cityNameToId, cityOptions } = useCatalogData();

  const hero = useMemo<HomeHeroState>(
    () => ({
      mode,
      categoryId,
      title,
      price,
      city,
      hasDocuments,
      condition,
    }),
    [categoryId, city, condition, hasDocuments, mode, price, title],
  );

  const filteredListingsQuery = useFilteredListings({
    appliedFilters,
    cityNameToId,
    categoryUiKeyToBackendId,
  });

  const heroRecommendationsQuery = useHeroRecommendations({
    hero,
    cityNameToId,
    categoryUiKeyToBackendId,
  });

  const resetFilters = useCallback(() => {
    const defaults = createDefaultFilters();
    setFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedFilters((current) => {
        const same = JSON.stringify(current) === JSON.stringify(filters);
        return same ? current : filters;
      });
    }, FILTERS_AUTO_APPLY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const applyHeroToFilters = useCallback(() => {
    const nextFilters = heroToFilters(hero);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }, [hero]);

  const openFiltersAndScroll = useCallback(() => {
    const nextFilters = heroToFilters(hero);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setIsFiltersOpen(true);

    window.requestAnimationFrame(() => {
      document.getElementById("home-recommendations")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [hero]);

  const value = useMemo<HomeSearchContextValue>(
    () => ({
      hero,
      setMode,
      setCategoryId,
      setTitle,
      setPrice,
      setCity,
      setHasDocuments,
      setCondition,
      filters,
      setFilters,
      appliedFilters,
      resetFilters,
      applyFilters,
      applyHeroToFilters,
      openFiltersAndScroll,
      isFiltersOpen,
      setIsFiltersOpen,
      heroRecommendations: heroRecommendationsQuery.data ?? [],
      heroRecommendationsLoading: heroRecommendationsQuery.isLoading,
      filteredListings: filteredListingsQuery.data?.items ?? [],
      listingsCount: filteredListingsQuery.data?.total ?? 0,
      cityOptions,
      categories,
    }),
    [
      applyFilters,
      applyHeroToFilters,
      appliedFilters,
      categories,
      cityOptions,
      filteredListingsQuery.data,
      filters,
      hero,
      heroRecommendationsQuery.data,
      heroRecommendationsQuery.isLoading,
      isFiltersOpen,
      openFiltersAndScroll,
      resetFilters,
    ],
  );

  return <HomeSearchContext.Provider value={value}>{children}</HomeSearchContext.Provider>;
}

export function useHomeSearch() {
  const context = useContext(HomeSearchContext);
  if (!context) {
    throw new Error("useHomeSearch must be used within HomeSearchProvider");
  }
  return context;
}
