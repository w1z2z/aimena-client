"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CategoryId } from "@/shared/ui/icons/category-icons";

import {
  filterListingsByFilters,
  getHeroRecommendations,
  heroToFilters,
} from "./filter-listings";
import { mockListings } from "./mock-listings";
import {
  createDefaultFilters,
  DEFAULT_HERO_CONDITION,
  type HomeFiltersState,
  type HomeHeroState,
  type HomeSearchMode,
} from "./types";

type HomeSearchContextValue = {
  hero: HomeHeroState;
  setMode: (mode: HomeSearchMode) => void;
  setCategoryId: (categoryId: CategoryId) => void;
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
  heroRecommendations: typeof mockListings;
  filteredListings: typeof mockListings;
  listingsCount: number;
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HomeSearchMode>("exchange");
  const [categoryId, setCategoryId] = useState<CategoryId>("all");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [hasDocuments, setHasDocuments] = useState(false);
  const [condition, setCondition] = useState(DEFAULT_HERO_CONDITION);
  const [filters, setFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  const heroRecommendations = useMemo(
    () => getHeroRecommendations(mockListings, hero),
    [hero],
  );

  const filteredListings = useMemo(
    () => filterListingsByFilters(mockListings, appliedFilters),
    [appliedFilters],
  );

  const listingsCount = filteredListings.length;

  const resetFilters = useCallback(() => {
    const defaults = createDefaultFilters();
    setFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

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
      heroRecommendations,
      filteredListings,
      listingsCount,
    }),
    [
      applyFilters,
      applyHeroToFilters,
      appliedFilters,
      filteredListings,
      filters,
      hero,
      heroRecommendations,
      isFiltersOpen,
      listingsCount,
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
