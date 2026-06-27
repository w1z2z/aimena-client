"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCategories, getCities } from "@/shared/api/catalog";
import { ApiError } from "@/shared/api/http";
import { getListings, getRecommendations, type ApiListingCondition } from "@/shared/api/listings";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import { mapListingCardToHomeCard } from "@/shared/api/mappers";
import type { SelectOption } from "@/shared/ui/select-field";

import { CONDITION_LABEL_TO_ID } from "./constants";
import { heroToFilters } from "./filter-listings";
import {
  createDefaultFilters,
  DEFAULT_HERO_CONDITION,
  type HomeCategoryItem,
  type HomeListingCard,
  type HomeFiltersState,
  type HomeHeroState,
  type HomeSearchMode,
} from "./types";

const CONDITION_TO_BACKEND: Record<string, ApiListingCondition> = {
  excellent: "excellent",
  new: "new",
  good: "good",
  used: "used",
  repair: "needs_repair",
};
const FILTERS_AUTO_APPLY_DEBOUNCE_MS = 200;
const HERO_RECOMMENDATIONS_LIMIT = 5;
const HERO_RANDOM_POOL_SIZE = 24;

function parsePrice(value: string): number | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

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
  heroRecommendations: HomeListingCard[];
  heroRecommendationsLoading: boolean;
  filteredListings: HomeListingCard[];
  listingsCount: number;
  cityOptions: SelectOption[];
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
  const [heroRecommendations, setHeroRecommendations] = useState<HomeListingCard[]>([]);
  const [heroRecommendationsLoading, setHeroRecommendationsLoading] = useState(true);
  const [filteredListings, setFilteredListings] = useState<HomeListingCard[]>([]);
  const [listingsCount, setListingsCount] = useState(0);
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [cityNameToId, setCityNameToId] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<HomeCategoryItem[]>([]);
  const [categoryUiKeyToBackendId, setCategoryUiKeyToBackendId] = useState<Record<string, string>>(
    {},
  );

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

  useEffect(() => {
    let isActive = true;

    void Promise.all([
      getCategories({ homeArc: true }).catch(() => null),
      getCities({ page: 1, pageSize: 50 }).catch(() => null),
    ]).then(([categoriesResponse, citiesResponse]) => {
      if (!isActive) return;

      if (categoriesResponse) {
        const nextCategoryOptions = categoriesResponse.data
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
          );
        setCategories(nextCategoryOptions);

        const nextCategoryMap: Record<string, string> = {};
        for (const item of categoriesResponse.data) {
          if (item.uiKey && !item.isVirtual) {
            nextCategoryMap[item.uiKey] = item.id;
          }
        }
        setCategoryUiKeyToBackendId(nextCategoryMap);
      }

      if (citiesResponse) {
        const allCities = [...citiesResponse.data.featured, ...citiesResponse.data.cities];
        const nextCityMap: Record<string, string> = {};

        for (const cityItem of allCities) {
          const name = cityItem.name.trim();
          if (!name) continue;

          const cityKey = normalizeLookupKey(name);
          if (!nextCityMap[cityKey]) {
            nextCityMap[cityKey] = cityItem.id;
          }
        }

        setCityOptions(
          buildCitySelectOptions({
            featured: citiesResponse.data.featured,
            cities: citiesResponse.data.cities,
            mapCityToOption: (cityItem) => ({
              value: cityItem.name.trim(),
              label: cityItem.name.trim(),
            }),
          }),
        );
        setCityNameToId(nextCityMap);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const cityId = cityNameToId[normalizeLookupKey(appliedFilters.city)];
    const categoryId = categoryUiKeyToBackendId[appliedFilters.category];
    const mappedConditions = appliedFilters.conditions
      .map((conditionId) => CONDITION_TO_BACKEND[conditionId])
      .filter((value): value is ApiListingCondition => Boolean(value));
    const priceFrom = parsePrice(appliedFilters.priceFrom);
    const priceTo = parsePrice(appliedFilters.priceTo);

    const controller = new AbortController();
    void getListings(
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
        publishedRange: appliedFilters.datePeriod === "all" ? undefined : appliedFilters.datePeriod,
        hasDocuments: appliedFilters.withDocuments ? true : undefined,
        hasExtraPay: appliedFilters.withSurcharge ? true : undefined,
        condition: mappedConditions.length > 0 ? mappedConditions : undefined,
        verifiedProvider: appliedFilters.verifiedProvider ? true : undefined,
        serviceFormats:
          appliedFilters.listingMode === "service" && appliedFilters.serviceFormats.length > 0
            ? appliedFilters.serviceFormats
            : undefined,
        priceFrom,
        priceTo,
      },
      controller.signal,
    )
      .then((response) => {
        setFilteredListings(response.data.map(mapListingCardToHomeCard));
        setListingsCount(response.meta.total);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.status === 404) return;
        setFilteredListings([]);
        setListingsCount(0);
      });

    return () => {
      controller.abort();
    };
  }, [appliedFilters, categoryUiKeyToBackendId, cityNameToId]);

  useEffect(() => {
    const controller = new AbortController();
    setHeroRecommendationsLoading(true);

    const timeoutId = window.setTimeout(() => {
      const isAllCategory = hero.categoryId === "all";
      const categoryBackendId =
        isAllCategory ? undefined : categoryUiKeyToBackendId[hero.categoryId];
      const cityId = cityNameToId[normalizeLookupKey(hero.city)];
      const parsedPrice = parsePrice(hero.price);
      const backendCondition =
        hero.mode === "browse"
          ? CONDITION_TO_BACKEND[CONDITION_LABEL_TO_ID[hero.condition] ?? ""]
          : undefined;
      const sharedFilters = {
        cityId,
        query: hero.title.trim() || undefined,
        hasDocuments: hero.mode === "browse" && hero.hasDocuments ? true : undefined,
        condition: backendCondition ? [backendCondition] : undefined,
        priceFrom: parsedPrice ? Math.max(Math.round(parsedPrice * 0.75), 0) : undefined,
        priceTo: parsedPrice ?? undefined,
      };
      const categoryFilters = isAllCategory
        ? {}
        : {
            categoryId: categoryBackendId,
            categoryUiKey: hero.categoryId,
          };

      const finalizeRecommendations = (items: HomeListingCard[]) => {
        setHeroRecommendations(items);
        setHeroRecommendationsLoading(false);
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
          controller.signal,
        );

      const request = isAllCategory
        ? fetchListingsFeed(hero.mode === "exchange" ? "have" : "want", HERO_RANDOM_POOL_SIZE).then(
            (response) =>
              shuffleItems(response.data.map(mapListingCardToHomeCard)).slice(0, HERO_RECOMMENDATIONS_LIMIT),
          )
        : hero.mode === "exchange"
          ? getRecommendations(
              {
                limit: HERO_RECOMMENDATIONS_LIMIT,
                ...sharedFilters,
                ...categoryFilters,
              },
              controller.signal,
            )
              .catch((requestError) => {
                if (requestError instanceof ApiError && requestError.status === 404) {
                  return fetchListingsFeed("have", HERO_RECOMMENDATIONS_LIMIT);
                }
                throw requestError;
              })
              .then((response) => response.data.map(mapListingCardToHomeCard))
          : fetchListingsFeed("want", HERO_RECOMMENDATIONS_LIMIT).then((response) =>
              response.data.map(mapListingCardToHomeCard),
            );

      void request
        .then((items) => {
          finalizeRecommendations(items);
        })
        .catch(() => {
          finalizeRecommendations([]);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [hero, categoryUiKeyToBackendId, cityNameToId]);

  const resetFilters = useCallback(() => {
    const defaults = createDefaultFilters();
    setFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedFilters((current) => {
        const same =
          JSON.stringify(current) === JSON.stringify(filters);
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
      heroRecommendations,
      heroRecommendationsLoading,
      filteredListings,
      listingsCount,
      cityOptions,
      categories,
    }),
    [
      applyFilters,
      applyHeroToFilters,
      appliedFilters,
      filteredListings,
      filters,
      hero,
      heroRecommendations,
      heroRecommendationsLoading,
      isFiltersOpen,
      listingsCount,
      openFiltersAndScroll,
      resetFilters,
      cityOptions,
      categories,
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
