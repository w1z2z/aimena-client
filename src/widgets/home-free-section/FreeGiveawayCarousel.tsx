"use client";

import { useMemo } from "react";

import { ListingCard } from "@/entities/listing";
import type { ListingCardPreview } from "@/entities/listing";

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
      <svg
        width={15}
        height={25}
        viewBox="0 0 15 25"
        fill="none"
        aria-hidden
        className={`block shrink-0 h-[25px] w-[15px] text-[#1A1A1A] ${isLeft ? "" : "scale-x-[-1]"}`}
      >
        <path
          d="M14.4263 0.550895C14.7936 0.903707 15 1.38218 15 1.88108C15 2.37997 14.7936 2.85844 14.4263 3.21126L4.72795 12.524L14.4263 21.8367C14.772 22.1933 14.9601 22.6647 14.9512 23.1518C14.9423 23.6388 14.7369 24.1036 14.3784 24.4482C14.0199 24.7929 13.5361 24.9906 13.0289 24.9997C12.5217 25.0088 12.0305 24.8286 11.6588 24.4971L0.573707 13.8556C0.206364 13.5028 5.69313e-07 13.0244 5.47505e-07 12.5255C5.25698e-07 12.0266 0.206364 11.5481 0.573707 11.1953L11.6558 0.550895C12.0232 0.198158 12.5215 -5.47331e-07 13.041 -5.70042e-07C13.5606 -5.92752e-07 14.0589 0.198158 14.4263 0.550895Z"
          fill="currentColor"
        />
      </svg>
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
          <CarouselArrowButton direction="left" onClick={() => scrollByStep(-1)} />
          <CarouselArrowButton direction="right" onClick={() => scrollByStep(1)} />
        </>
      ) : null}
    </div>
  );
}
