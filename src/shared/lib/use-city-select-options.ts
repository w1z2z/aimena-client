"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getCities, type ApiCity } from "@/shared/api/catalog";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import type { SelectOption } from "@/shared/ui/select-field";

const CITY_FETCH_DEBOUNCE_MS = 250;

function mergeCitiesById(current: ApiCity[], incoming: ApiCity[]): ApiCity[] {
  const merged = [...current];
  const seen = new Set(current.map((cityItem) => cityItem.id));

  for (const cityItem of incoming) {
    if (seen.has(cityItem.id)) continue;
    seen.add(cityItem.id);
    merged.push(cityItem);
  }

  return merged;
}

function mapCityToOption(cityItem: ApiCity): SelectOption {
  return {
    value: cityItem.id,
    label: cityItem.regionName ? `${cityItem.name}, ${cityItem.regionName}` : cityItem.name,
  };
}

type UseCitySelectOptionsParams = {
  selectedCityId?: string;
  pinnedOption?: SelectOption | null;
};

export function useCitySelectOptions({
  selectedCityId = "",
  pinnedOption = null,
}: UseCitySelectOptionsParams = {}) {
  const [cityQuery, setCityQuery] = useState("");
  const [debouncedCityQuery, setDebouncedCityQuery] = useState("");
  const [featuredCities, setFeaturedCities] = useState<ApiCity[]>([]);
  const [regularCities, setRegularCities] = useState<ApiCity[]>([]);
  const [cityPage, setCityPage] = useState(1);
  const [cityPageCount, setCityPageCount] = useState(1);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const latestCitiesRequestRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCityQuery(cityQuery.trim());
      setCityPage(1);
    }, CITY_FETCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cityQuery]);

  useEffect(() => {
    let cancelled = false;
    const requestId = latestCitiesRequestRef.current + 1;
    latestCitiesRequestRef.current = requestId;

    setIsCityLoading(true);
    void getCities({
      q: debouncedCityQuery || undefined,
      page: cityPage,
      pageSize: 50,
    })
      .then((response) => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        const nextFeatured = response.data.featured;
        const nextRegular = response.data.cities;
        setCityPageCount(Math.max(response.meta.pageCount, 1));
        setFeaturedCities((current) =>
          cityPage === 1 ? nextFeatured : mergeCitiesById(current, nextFeatured),
        );
        setRegularCities((current) =>
          cityPage === 1 ? nextRegular : mergeCitiesById(current, nextRegular),
        );
      })
      .catch(() => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        if (cityPage === 1) {
          setFeaturedCities([]);
          setRegularCities([]);
          setCityPageCount(1);
        }
      })
      .finally(() => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        setIsCityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityPage, debouncedCityQuery]);

  const cityOptions = useMemo(() => {
    const options = buildCitySelectOptions({
      featured: featuredCities,
      cities: regularCities,
      mapCityToOption,
    });

    if (
      selectedCityId &&
      pinnedOption?.value === selectedCityId &&
      !options.some((option) => option.value === selectedCityId)
    ) {
      return [pinnedOption, ...options];
    }

    return options;
  }, [featuredCities, pinnedOption, regularCities, selectedCityId]);

  const onCityInputChange = (value: string) => {
    setCityQuery(value);
  };

  const onCityListEndReached = () => {
    if (isCityLoading) return;
    if (cityPage >= cityPageCount) return;
    setCityPage((current) => current + 1);
  };

  return {
    cityOptions,
    onCityInputChange,
    onCityListEndReached,
    isCityLoading,
  };
}
