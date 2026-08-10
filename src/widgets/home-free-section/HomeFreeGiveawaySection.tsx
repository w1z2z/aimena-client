"use client";

import { ListingCardSkeleton, useFreeListings } from "@/entities/listing";

import {
  CARD_GAP,
  CARD_WIDTH,
  CAROUSEL_OUTER_WIDTH,
  PANEL_HEIGHT,
  PANEL_PADDING,
  PANEL_WIDTH,
  PROMO_HEIGHT,
} from "./constants";
import { FreeGiveawayCarousel } from "./FreeGiveawayCarousel";
import { FreePromoBanner } from "./FreePromoBanner";

export function HomeFreeGiveawaySection() {
  const { items: freeListings, isLoading } = useFreeListings(8);

  return (
    <section className="bg-surface pb-[68px] pt-[68px] text-brand">
      <div className="mx-auto w-full max-w-container-home">
        <div className="flex flex-col gap-[68px]">
          <h2 className="text-[40px] font-bold leading-[40px] tracking-[-0.2px]">
            Отдаю <span className="text-[#8E8BED]">даром</span>
          </h2>

          <div
            className="relative box-border overflow-visible rounded-[20px] bg-surface-muted"
            style={{
              width: `${PANEL_WIDTH}px`,
              height: `${PANEL_HEIGHT}px`,
              padding: `${PANEL_PADDING}px`,
            }}
          >
            <div className="flex h-full items-center gap-[24px]">
              <FreePromoBanner />
              {isLoading ? (
                <div
                  className="flex shrink-0 items-center overflow-hidden"
                  style={{
                    width: `${CAROUSEL_OUTER_WIDTH}px`,
                    height: `${PROMO_HEIGHT}px`,
                    gap: `${CARD_GAP}px`,
                  }}
                  aria-busy="true"
                  aria-label="Загрузка объявлений даром"
                >
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} style={{ width: `${CARD_WIDTH}px` }} className="shrink-0">
                      <ListingCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : freeListings.length > 0 ? (
                <FreeGiveawayCarousel listings={freeListings} />
              ) : (
                <div
                  className="flex shrink-0 items-center justify-center rounded-[31px] bg-white/80 px-[24px] text-center text-[16px] font-semibold text-text-secondary"
                  style={{
                    width: `${CAROUSEL_OUTER_WIDTH}px`,
                    height: `${PROMO_HEIGHT}px`,
                  }}
                >
                  Пока нет объявлений в разделе &quot;Даром&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
