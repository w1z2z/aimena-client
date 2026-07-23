"use client";

import { useFreeListings } from "@/entities/listing";

import {
  CAROUSEL_OUTER_WIDTH,
  PANEL_HEIGHT,
  PANEL_PADDING,
  PANEL_WIDTH,
  PROMO_HEIGHT,
} from "./constants";
import { FreeGiveawayCarousel } from "./FreeGiveawayCarousel";
import { FreePromoBanner } from "./FreePromoBanner";

export function HomeFreeGiveawaySection() {
  const { items: freeListings } = useFreeListings(8);

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
              {freeListings.length > 0 ? (
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
