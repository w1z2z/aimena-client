"use client";

import { useMemo } from "react";

import { ListingCard } from "@/entities/listing";
import type { ListingCardPreview } from "@/entities/listing";
import { ChevronIcon } from "@/shared/ui/icons";

import {
  CARD_WIDTH,
  CAROUSEL_VISIBLE_WIDTH,
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
      <ChevronIcon direction={direction} className="h-[25px] w-[15px] text-brand" />
    </button>
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
      className="home-free-carousel-viewport relative shrink-0 overflow-hidden rounded-[20px]"
      style={{ width: `${CAROUSEL_VISIBLE_WIDTH}px` }}
      onMouseEnter={pauseAutoAdvance}
      onMouseLeave={resumeAutoAdvance}
    >
      <div
        ref={carouselRef}
        className="home-free-carousel flex snap-x snap-mandatory gap-[24px] overflow-x-auto overscroll-x-contain"
      >
        {loopListings.map((listing, index) => (
          <div
            key={`${listing.id}-${index}`}
            className="w-[342px] shrink-0 snap-start snap-always"
            style={{ width: `${CARD_WIDTH}px` }}
          >
            <ListingCard
              variant="free"
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
              coverImageUrl={listing.coverImageUrl}
            />
          </div>
        ))}
      </div>
      {itemCount > 1 ? (
        <>
          <CarouselArrowButton direction="left" onClick={() => scrollByStep(-1)} />
          <CarouselArrowButton direction="right" onClick={() => scrollByStep(1)} />
        </>
      ) : null}
    </div>
  );
}
