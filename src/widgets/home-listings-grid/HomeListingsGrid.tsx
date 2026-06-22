"use client";

import { useHomeSearch } from "@/features/home-search";

import { ExchangeListingCard } from "./ExchangeListingCard";

export function HomeListingsGrid() {
  const { filteredListings } = useHomeSearch();
  const visibleListings = filteredListings.slice(0, 12);

  if (visibleListings.length === 0) {
    return (
      <div className="home-listings-grid home-listings-grid--empty" aria-label="Лента объявлений">
        <p className="home-listings-grid__empty">
          По выбранным параметрам пока ничего не найдено. Попробуйте изменить фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="home-listings-grid" aria-label="Лента объявлений">
      {visibleListings.map((listing) => (
        <ExchangeListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}
