"use client";

import { ListingCard } from "@/entities/listing";
import { useHomeSearch } from "@/features/home-search";

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
        <ListingCard
          key={listing.id}
          listingId={listing.id}
          variant="exchange"
          title={listing.title}
          city={listing.city}
          condition={listing.condition}
          coverImageUrl={listing.coverImageUrl}
          wants={listing.wants}
          wantsMore={listing.wantsMore}
          isFavorite={listing.isFavorite}
        />
      ))}
    </div>
  );
}
