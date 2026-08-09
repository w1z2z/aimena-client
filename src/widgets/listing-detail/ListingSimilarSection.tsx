"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ListingCard, mapApiListingToCard, useSimilarListings } from "@/entities/listing";
import { layout } from "@/shared/config/tokens";
import { ChevronIcon } from "@/shared/ui/icons";

type ListingSimilarSectionProps = {
  listingId: string;
};

const CARD_WIDTH = layout.cardWidth;
const CARD_GAP = layout.cardGap;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const VISIBLE_COUNT = 4;

function CarouselArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const isLeft = direction === "left";

  return (
    <button
      type="button"
      aria-label={isLeft ? "Предыдущее объявление" : "Следующее объявление"}
      onClick={onClick}
      disabled={disabled}
      className={`listing-detail-similar__arrow listing-detail-similar__arrow--${direction}`}
    >
      <ChevronIcon direction={direction} className="h-[26px] w-[16px] text-brand" />
    </button>
  );
}

export function ListingSimilarSection({ listingId }: ListingSimilarSectionProps) {
  const { data, isLoading, isError } = useSimilarListings(listingId, 12);
  const cards = (data?.data ?? []).map(mapApiListingToCard);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(maxScroll - track.scrollLeft > 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncScrollState();
    track.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    const frameId = window.requestAnimationFrame(syncScrollState);
    return () => {
      track.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
      window.cancelAnimationFrame(frameId);
    };
  }, [cards.length, syncScrollState]);

  const scrollByStep = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * CARD_STEP,
      behavior: "smooth",
    });
  };

  if (isError) return null;

  const showArrows = cards.length > VISIBLE_COUNT;

  return (
    <section className="listing-detail-similar" aria-label="Похожие объявления">
      <div className="listing-detail-similar__header">
        <h2 className="listing-detail-similar__title">Похожие объявления</h2>
      </div>

      {isLoading && cards.length === 0 ? (
        <p className="listing-detail-similar__status">Загрузка…</p>
      ) : null}

      {!isLoading && cards.length === 0 ? (
        <p className="listing-detail-similar__status">Похожих объявлений пока нет.</p>
      ) : null}

      {cards.length > 0 ? (
        <div className="listing-detail-similar__viewport">
          <div
            ref={trackRef}
            className="listing-detail-similar__track"
            style={{ gap: `${CARD_GAP}px` }}
          >
            {cards.map((listing) => (
              <div
                key={listing.id}
                className="listing-detail-similar__item"
                style={{ width: `${CARD_WIDTH}px` }}
              >
                <ListingCard
                  listingId={listing.id}
                  variant={listing.isFree ? "free" : "exchange"}
                  title={listing.title}
                  city={listing.city}
                  condition={listing.condition}
                  coverImageUrl={listing.coverImageUrl}
                  wants={listing.wants}
                  wantCategories={listing.wantCategories}
                  isFree={listing.isFree}
                  isFavorite={listing.isFavorite}
                  ownerId={listing.ownerId}
                />
              </div>
            ))}
          </div>

          {showArrows ? (
            <>
              <CarouselArrowButton
                direction="left"
                onClick={() => scrollByStep(-1)}
                disabled={!canScrollLeft}
              />
              <CarouselArrowButton
                direction="right"
                onClick={() => scrollByStep(1)}
                disabled={!canScrollRight}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function formatEstimatedPrice(price: number | null) {
  if (price == null) return "—";
  return `~${new Intl.NumberFormat("ru-RU").format(price)}\u00A0₽`;
}
