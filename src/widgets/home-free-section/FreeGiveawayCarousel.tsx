"use client";

import { useMemo } from "react";

import { ListingCard } from "@/entities/listing";
import type { ListingCardPreview } from "@/entities/listing";
import { CarouselNavButton } from "@/shared/ui/CarouselNavButton";

import {
  CARD_GAP,
  CARD_WIDTH,
  CAROUSEL_EDGE_MASK,
  CAROUSEL_EDGE_PADDING,
  CAROUSEL_OUTER_WIDTH,
  CAROUSEL_SHADOW_Y_PADDING,
} from "./constants";
import { useInfiniteCarousel } from "./useInfiniteCarousel";

function CarouselEdgeMask({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`home-free-carousel-edge-mask pointer-events-none absolute inset-y-0 z-[1] bg-surface-muted ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ width: `${CAROUSEL_EDGE_MASK}px` }}
    />
  );
}

export function FreeGiveawayCarousel({ listings }: { listings: ListingCardPreview[] }) {
  const itemCount = listings.length;
  const { carouselRef, scrollByStep, pauseAutoAdvance, resumeAutoAdvance } =
    useInfiniteCarousel(itemCount);
  const loopListings = useMemo(
    () => [...listings, ...listings, ...listings],
    [listings],
  );

  return (
    <div
      className="home-free-carousel-viewport relative shrink-0"
      style={{
        width: `${CAROUSEL_OUTER_WIDTH}px`,
        margin: `-${CAROUSEL_SHADOW_Y_PADDING}px 0`,
      }}
      onMouseEnter={pauseAutoAdvance}
      onMouseLeave={resumeAutoAdvance}
    >
      <div
        ref={carouselRef}
        className="home-free-carousel flex overscroll-x-contain"
        style={{
          width: `${CAROUSEL_OUTER_WIDTH}px`,
          padding: `${CAROUSEL_SHADOW_Y_PADDING}px ${CAROUSEL_EDGE_PADDING}px`,
          gap: `${CARD_GAP}px`,
          boxSizing: "border-box",
        }}
      >
        {loopListings.map((listing, index) => (
          <div
            key={`${listing.id}-${index}`}
            className="home-free-carousel__item shrink-0"
            style={{ width: `${CARD_WIDTH}px` }}
          >
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
            className="absolute left-[14px] top-1/2 z-20 -translate-y-1/2"
          />
          <CarouselNavButton
            direction="right"
            label="Следующие объявления"
            onClick={() => scrollByStep(1)}
            className="absolute right-[14px] top-1/2 z-20 -translate-y-1/2"
          />
        </>
      ) : null}
    </div>
  );
}
