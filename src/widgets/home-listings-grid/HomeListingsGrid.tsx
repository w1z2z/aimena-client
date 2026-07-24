"use client";

import { useEffect, useRef } from "react";

import { ListingCard } from "@/entities/listing";
import { useHomeSearch } from "@/features/home-search";

export function HomeListingsGrid() {
  const {
    appliedFilters,
    filteredListings,
    filteredListingsLoading,
    fetchNextFilteredPage,
    hasNextFilteredPage,
    isFetchingNextFilteredPage,
  } = useHomeSearch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  /** Prevents auto-chaining pages when the first page does not fill the viewport. */
  const scrollUnlockedRef = useRef(false);

  useEffect(() => {
    scrollUnlockedRef.current = false;
  }, [appliedFilters]);

  useEffect(() => {
    const unlock = () => {
      scrollUnlockedRef.current = true;
    };

    window.addEventListener("scroll", unlock, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchmove", unlock, { passive: true });

    return () => {
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchmove", unlock);
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextFilteredPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!scrollUnlockedRef.current || isFetchingNextFilteredPage) return;
        fetchNextFilteredPage();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextFilteredPage, hasNextFilteredPage, isFetchingNextFilteredPage]);

  if (filteredListingsLoading && filteredListings.length === 0) {
    return (
      <div className="home-listings-grid home-listings-grid--empty" aria-label="Лента объявлений">
        <p className="home-listings-grid__loading">Загрузка…</p>
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <div className="home-listings-grid home-listings-grid--empty" aria-label="Лента объявлений">
        <p className="home-listings-grid__empty">
          По выбранным параметрам пока ничего не найдено. Попробуйте изменить фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="home-listings-grid-wrap">
      <div className="home-listings-grid" aria-label="Лента объявлений">
        {filteredListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listingId={listing.id}
            variant="exchange"
            title={listing.title}
            city={listing.city}
            condition={listing.condition}
            coverImageUrl={listing.coverImageUrl}
            wants={listing.wants}
            isFavorite={listing.isFavorite}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="home-listings-grid__sentinel" aria-hidden />
      {isFetchingNextFilteredPage ? (
        <p className="home-listings-grid__loading">Загрузка…</p>
      ) : null}
    </div>
  );
}
