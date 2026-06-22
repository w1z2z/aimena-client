"use client";

import { useCallback, useState } from "react";

import { FilterIcon } from "@/shared/ui/icons";

import { HomeRecommendationsFiltersPanelContent } from "./HomeRecommendationsFiltersPanelContent";

export function HomeRecommendationsHeader() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((current) => !current);
  }, []);

  return (
    <section className="bg-[#F8F8F5] pb-[68px] text-[#1A1A1A]">
      <div className="mx-auto w-full max-w-[1441px]">
        <div className="home-recommendations-header-wrap">
          <div className="home-recommendations-header">
            <div className="home-recommendations-header__title-group">
              <h2 className="home-recommendations-header__heading">
                <span>Попробуй найти, то что</span>{" "}
                <span className="home-recommendations-header__heading-accent">нужно</span>
              </h2>
              <p className="home-recommendations-header__count">2 304 предложения</p>
            </div>

            <button
              type="button"
              className={`home-recommendations-header__filter${isFiltersOpen ? " is-active" : ""}`}
              aria-expanded={isFiltersOpen}
              aria-controls="home-recommendations-filters-panel"
              onClick={toggleFilters}
            >
              <FilterIcon className="home-recommendations-header__filter-icon" />
              <span className="home-recommendations-header__filter-label">Фильтры</span>
            </button>
          </div>

          <div
            id="home-recommendations-filters-panel"
            className={`home-recommendations-filters-panel${isFiltersOpen ? " is-open" : ""}`}
            aria-hidden={!isFiltersOpen}
          >
            <div className="home-recommendations-filters-panel__inner">
              <div className="home-recommendations-filters-panel__surface">
                <HomeRecommendationsFiltersPanelContent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
