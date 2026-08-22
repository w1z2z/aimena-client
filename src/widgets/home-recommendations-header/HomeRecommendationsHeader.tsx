"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useHomeSearch } from "@/features/home-search";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";
import { FilterIcon } from "@/shared/ui/icons";
import { HomeListingsGrid } from "@/widgets/home-listings-grid/HomeListingsGrid";
import { COMPACT_HEADER_QUERY } from "@/widgets/header/constants";

import { HomeRecommendationsFiltersPanelContent } from "./HomeRecommendationsFiltersPanelContent";

function formatOffersCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count.toLocaleString("ru-RU")} предложение`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count.toLocaleString("ru-RU")} предложения`;
  }

  return `${count.toLocaleString("ru-RU")} предложений`;
}

export function HomeRecommendationsHeader() {
  const { isFiltersOpen, setIsFiltersOpen, listingsCount, applyFilters, resetFilters } =
    useHomeSearch();
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
  const useModal = isCompact;
  const { isRendered, isVisible } = useOverlayPresence(isFiltersOpen);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useScrollLock(useModal && isRendered, modalScrollRef);

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((current) => !current);
  }, [setIsFiltersOpen]);

  const closeFilters = useCallback(() => {
    setIsFiltersOpen(false);
  }, [setIsFiltersOpen]);

  const handleModalApply = useCallback(() => {
    applyFilters();
    closeFilters();
  }, [applyFilters, closeFilters]);

  useEffect(() => {
    if (!useModal || !isVisible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFilters();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [useModal, isVisible, closeFilters]);

  const filtersControlsId = useModal
    ? "home-recommendations-filters-modal"
    : "home-recommendations-filters-panel";

  return (
    <section id="home-recommendations" className="bg-[#F8F8F5] pb-[68px] text-[#1A1A1A]">
      <div className="home-recommendations__inner">
        <div className="home-recommendations-header-wrap">
          <div className="home-recommendations-header">
            <div className="home-recommendations-header__title-group">
              <h2 className="home-recommendations-header__heading">
                <span>Попробуй найти, то что</span>{" "}
                <span className="home-recommendations-header__heading-accent">нужно</span>
              </h2>
              <p className="home-recommendations-header__count">{formatOffersCount(listingsCount)}</p>
            </div>

            <button
              type="button"
              className={`home-recommendations-header__filter${isFiltersOpen ? " is-active" : ""}`}
              aria-expanded={isFiltersOpen}
              aria-controls={filtersControlsId}
              onClick={toggleFilters}
            >
              <FilterIcon className="home-recommendations-header__filter-icon" />
              <span className="home-recommendations-header__filter-label">Фильтры</span>
            </button>
          </div>

          {!useModal ? (
            <div
              id="home-recommendations-filters-panel"
              className={`home-recommendations-filters-panel${isRendered ? " is-open" : ""}`}
              aria-hidden={!isVisible}
            >
              <div className="home-recommendations-filters-panel__inner">
                <div
                  className={`home-recommendations-filters-panel__surface${isVisible ? " is-open" : ""}`}
                >
                  <HomeRecommendationsFiltersPanelContent />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div id="home-recommendations-feed" className="home-recommendations-feed">
          <HomeListingsGrid />
        </div>
      </div>

      {useModal && isRendered
        ? createPortal(
            <div className="home-filters-modal" data-open={isVisible ? "true" : undefined}>
              <button
                type="button"
                className={`home-filters-modal__backdrop overlay-backdrop${isVisible ? " is-open" : ""}`}
                aria-label="Закрыть фильтры"
                tabIndex={isVisible ? 0 : -1}
                onClick={closeFilters}
              />
              <div
                id="home-recommendations-filters-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Фильтры"
                aria-hidden={!isVisible}
                className={`home-filters-modal__sheet${isVisible ? " is-open" : ""}`}
              >
                <div className="home-filters-modal__header">
                  <h3 className="home-filters-modal__title">Фильтры</h3>
                  <button
                    type="button"
                    className="home-filters-modal__close"
                    aria-label="Закрыть"
                    onClick={closeFilters}
                  >
                    ×
                  </button>
                </div>
                <div ref={modalScrollRef} className="home-filters-modal__body">
                  <HomeRecommendationsFiltersPanelContent hideActions />
                </div>
                <div className="home-filters-modal__footer">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="home-filters-panel__reset"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={handleModalApply}
                    className="home-filters-panel__apply"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
