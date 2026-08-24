"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { excludeOwnListings, type ListingCardData } from "@/entities/listing";
import { useAuth } from "@/features/auth";
import { writeHeroListingDraft } from "@/shared/lib/hero-listing-draft";
import { useCitySelectOptions } from "@/shared/lib/use-city-select-options";
import type { SelectOption } from "@/shared/ui/select-field";
import { COMPACT_HEADER_MAX_WIDTH_PX } from "@/widgets/header/constants";

import { useCatalogData, type HomeCategoryTreeNode } from "./hooks/useCatalogData";
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
import {
  consumeHomeTitleSearch,
  onHomeTitleSearch,
} from "@/shared/lib/home-title-search";
import {
  consumeOpenHomeFilters,
  onOpenHomeFilters,
  type OpenHomeFiltersPayload,
} from "@/shared/lib/home-open-filters";

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
  applyTitleSearch: (title: string) => void;
  openFiltersAndScroll: (
    payload?: OpenHomeFiltersPayload,
    options?: { openPanel?: boolean },
  ) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  heroRecommendations: ListingCardData[];
  heroRecommendationsLoading: boolean;
  filteredListings: ListingCardData[];
  listingsCount: number;
  filteredListingsLoading: boolean;
  fetchNextFilteredPage: () => void;
  hasNextFilteredPage: boolean;
  isFetchingNextFilteredPage: boolean;
  cityOptions: SelectOption[];
  onCityInputChange: (value: string) => void;
  onCityListEndReached: () => void;
  pinSelectedCity: (option: SelectOption | null) => void;
  categories: HomeCategoryItem[];
  categoryTree: HomeCategoryTreeNode[];
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<HomeSearchMode>("exchange");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [pinnedCityOption, setPinnedCityOption] = useState<SelectOption | null>(null);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [condition, setCondition] = useState(DEFAULT_HERO_CONDITION);
  const [filters, setFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<HomeFiltersState>(createDefaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { categories, categoryTree, categoryUiKeyToBackendId } = useCatalogData();
  const selectedCityId = city || filters.city;
  const { cityOptions, onCityInputChange, onCityListEndReached } = useCitySelectOptions({
    selectedCityId,
    pinnedOption: pinnedCityOption,
  });

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
  });

  const heroRecommendationsQuery = useHeroRecommendations({
    hero,
    categoryUiKeyToBackendId,
  });

  const pinSelectedCity = useCallback((option: SelectOption | null) => {
    setPinnedCityOption(option);
  }, []);

  const handleSetCity = useCallback(
    (nextCity: string) => {
      setCity(nextCity);
      if (!nextCity) {
        setPinnedCityOption(null);
        return;
      }
      const option = cityOptions.find((item) => item.value === nextCity && !item.disabled);
      if (option) setPinnedCityOption(option);
    },
    [cityOptions],
  );

  useEffect(() => {
    if (mode !== "exchange") return;

    writeHeroListingDraft({
      title,
      price,
      cityId: city,
      cityLabel: pinnedCityOption?.value === city ? pinnedCityOption.label : "",
    });
  }, [city, mode, pinnedCityOption, price, title]);

  const resetFilters = useCallback(() => {
    const defaults = createDefaultFilters();
    setFilters(defaults);
    setAppliedFilters(defaults);
    if (!city) setPinnedCityOption(null);
  }, [city]);

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
    const nextFilters = heroToFilters(hero, categoryUiKeyToBackendId);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }, [categoryUiKeyToBackendId, hero]);

  const applyTitleSearch = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setFilters((current) => ({ ...current, titleQuery: trimmed }));
    setAppliedFilters((current) => ({ ...current, titleQuery: trimmed }));
    setIsFiltersOpen(true);

    const scrollToResults = () => {
      document.getElementById("home-recommendations")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    // Wait a frame (filters expand) then scroll; second pass for late layout.
    window.requestAnimationFrame(() => {
      scrollToResults();
      window.setTimeout(scrollToResults, 120);
    });
  }, []);

  const openFiltersAndScroll = useCallback(
    (payload?: OpenHomeFiltersPayload, options?: { openPanel?: boolean }) => {
      const base = heroToFilters(hero, categoryUiKeyToBackendId);
      const nextFilters = {
        ...base,
        ...(payload?.searchMode ? { searchMode: payload.searchMode } : {}),
        ...(payload?.categoryParentId
          ? {
              listingMode: payload.listingMode ?? ("item" as const),
              categoryParentId: payload.categoryParentId,
              categoryChildId: payload.categoryChildId ?? "",
            }
          : {}),
      };
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);

      const isCompact =
        typeof window !== "undefined" &&
        window.matchMedia(`(max-width: ${COMPACT_HEADER_MAX_WIDTH_PX}px)`).matches;

      const shouldOpenPanel = options?.openPanel ?? true;
      if (shouldOpenPanel) {
        setIsFiltersOpen(true);
      }

      if (!isCompact) {
        document.getElementById("home-recommendations")?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
        return;
      }

      const scrollToFeed = () => {
        document.getElementById("home-recommendations-feed")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      };

      window.requestAnimationFrame(() => {
        scrollToFeed();
        window.setTimeout(scrollToFeed, 280);
      });
    },
    [categoryUiKeyToBackendId, hero],
  );

  useEffect(() => {
    const pending = consumeHomeTitleSearch();
    if (pending) {
      applyTitleSearch(pending);
    }
    return onHomeTitleSearch((title) => {
      consumeHomeTitleSearch();
      applyTitleSearch(title);
    });
  }, [applyTitleSearch]);

  useLayoutEffect(() => {
    const pending = consumeOpenHomeFilters();
    if (pending) {
      openFiltersAndScroll(pending);
    }
    return onOpenHomeFilters((payload) => {
      consumeOpenHomeFilters();
      openFiltersAndScroll(payload);
    });
  }, [openFiltersAndScroll]);

  const filteredListings = useMemo(
    () =>
      excludeOwnListings(
        filteredListingsQuery.data?.pages.flatMap((page) => page.items) ?? [],
        user?.id,
      ),
    [filteredListingsQuery.data, user?.id],
  );

  const listingsCount = filteredListingsQuery.data?.pages[0]?.total ?? 0;

  const fetchNextFilteredPage = useCallback(() => {
    if (!filteredListingsQuery.hasNextPage || filteredListingsQuery.isFetchingNextPage) {
      return;
    }
    void filteredListingsQuery.fetchNextPage();
  }, [filteredListingsQuery]);

  const value = useMemo<HomeSearchContextValue>(
    () => ({
      hero,
      setMode,
      setCategoryId,
      setTitle,
      setPrice,
      setCity: handleSetCity,
      setHasDocuments,
      setCondition,
      filters,
      setFilters,
      appliedFilters,
      resetFilters,
      applyFilters,
      applyHeroToFilters,
      applyTitleSearch,
      openFiltersAndScroll,
      isFiltersOpen,
      setIsFiltersOpen,
      heroRecommendations: excludeOwnListings(
        heroRecommendationsQuery.data ?? [],
        user?.id,
      ),
      heroRecommendationsLoading: heroRecommendationsQuery.isLoading,
      filteredListings,
      listingsCount,
      filteredListingsLoading: filteredListingsQuery.isLoading,
      fetchNextFilteredPage,
      hasNextFilteredPage: Boolean(filteredListingsQuery.hasNextPage),
      isFetchingNextFilteredPage: filteredListingsQuery.isFetchingNextPage,
      cityOptions,
      onCityInputChange,
      onCityListEndReached,
      pinSelectedCity,
      categories,
      categoryTree,
    }),
    [
      applyFilters,
      applyHeroToFilters,
      applyTitleSearch,
      appliedFilters,
      categories,
      categoryTree,
      cityOptions,
      fetchNextFilteredPage,
      filteredListings,
      filteredListingsQuery.hasNextPage,
      filteredListingsQuery.isFetchingNextPage,
      filteredListingsQuery.isLoading,
      filters,
      handleSetCity,
      hero,
      heroRecommendationsQuery.data,
      heroRecommendationsQuery.isLoading,
      isFiltersOpen,
      listingsCount,
      onCityInputChange,
      onCityListEndReached,
      openFiltersAndScroll,
      pinSelectedCity,
      resetFilters,
      user?.id,
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
