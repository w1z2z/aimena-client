"use client";

import { useMemo } from "react";

import { ListingCard } from "@/entities/listing";
import type { ListingCardPreview } from "@/entities/listing";
import { ChevronIcon } from "@/shared/ui/icons";

import {
  CARD_GAP,
  CARD_WIDTH,
  CAROUSEL_EDGE_MASK,
  CAROUSEL_EDGE_PADDING,
  CAROUSEL_OUTER_WIDTH,
  CAROUSEL_SHADOW_Y_PADDING,
} from "./constants";
import { useInfiniteCarousel } from "./useInfiniteCarousel";

function CarouselArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const isLeft = direction === "left";

  return (
    <button
      type="button"
      aria-label={isLeft ? "Предыдущие объявления" : "Следующие объявления"}
      onClick={onClick}
      className={`absolute top-1/2 z-20 flex h-[49px] w-[39px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)] active:translate-y-[calc(-50%+0.5px)] ${
        isLeft ? "left-[14px]" : "right-[14px]"
      }`}
    >
      <ChevronIcon direction={direction} className="h-[26px] w-[16px] text-brand" />
    </button>
  );
}

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
        className="home-free-carousel flex snap-x snap-mandatory overscroll-x-contain"
        style={{
          width: `${CAROUSEL_OUTER_WIDTH}px`,
          padding: `${CAROUSEL_SHADOW_Y_PADDING}px ${CAROUSEL_EDGE_PADDING}px`,
          scrollPadding: `0 ${CAROUSEL_EDGE_PADDING}px`,
          gap: `${CARD_GAP}px`,
          boxSizing: "border-box",
        }}
      >
        {loopListings.map((listing, index) => (
          <div
            key={`${listing.id}-${index}`}
            className="home-free-carousel__item shrink-0 snap-start snap-always"
            style={{ width: `${CARD_WIDTH}px` }}
          >
            <ListingCard
              listingId={listing.id}
              variant="free"
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
              coverImageUrl={listing.coverImageUrl}
              isFavorite={listing.isFavorite}
            />
          </div>
        ))}
      </div>
      <CarouselEdgeMask side="left" />
      <CarouselEdgeMask side="right" />
      {itemCount > 1 ? (
        <>
          <CarouselArrowButton direction="left" onClick={() => scrollByStep(-1)} />
          <CarouselArrowButton direction="right" onClick={() => scrollByStep(1)} />
        </>
      ) : null}
    </div>
  );
}
