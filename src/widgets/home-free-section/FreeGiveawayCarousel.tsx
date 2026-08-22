"use client";

import { useMemo } from "react";

import { ListingCard } from "@/entities/listing";
import type { ListingCardPreview } from "@/entities/listing";
import { CarouselNavButton } from "@/shared/ui/CarouselNavButton";

import { useInfiniteCarousel } from "./useInfiniteCarousel";

function CarouselEdgeMask({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`home-free-carousel-edge-mask home-free-carousel-edge-mask--${side}`}
    />
  );
}

export function FreeGiveawayCarousel({ listings }: { listings: ListingCardPreview[] }) {
  const itemCount = listings.length;
  const { carouselRef, scrollByStep } = useInfiniteCarousel(itemCount);
  const loopListings = useMemo(
    () => [...listings, ...listings, ...listings],
    [listings],
  );

  return (
    <div className="home-free-carousel-viewport">
      <div ref={carouselRef} className="home-free-carousel">
        {loopListings.map((listing, index) => (
          <div key={`${listing.id}-${index}`} className="home-free-carousel__item">
            <ListingCard
              listingId={listing.id}
              variant="free"
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
              coverImageUrl={listing.coverImageUrl}
              isFree
              isFavorite={listing.isFavorite}
              ownerId={listing.ownerId}
            />
          </div>
        ))}
      </div>
      <CarouselEdgeMask side="left" />
      <CarouselEdgeMask side="right" />
      {itemCount > 1 ? (
        <>
          <CarouselNavButton
            direction="left"
            label="Предыдущие объявления"
            onClick={() => scrollByStep(-1)}
            className="absolute left-[14px] top-1/2 z-30 -translate-y-1/2"
          />
          <CarouselNavButton
            direction="right"
            label="Следующие объявления"
            onClick={() => scrollByStep(1)}
            className="absolute right-[14px] top-1/2 z-30 -translate-y-1/2"
          />
        </>
      ) : null}
    </div>
  );
}
