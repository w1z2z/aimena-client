"use client";

import { useFreeListings } from "@/entities/listing";

import { CAROUSEL_VISIBLE_WIDTH } from "./constants";
import { FreeGiveawayCarousel } from "./FreeGiveawayCarousel";
import { FreePromoBanner } from "./FreePromoBanner";

export function HomeFreeGiveawaySection() {
  const { items: freeListings } = useFreeListings(8);

  return (
    <section className="bg-surface pb-[68px] pt-[68px] text-brand">
      <div className="mx-auto w-full max-w-container-home">
        <div className="flex flex-col gap-[68px]">
          <h2 className="text-[40px] font-bold leading-[40px] tracking-[-0.2px]">
            Отдаю <span className="text-accent">даром</span>
          </h2>

          <div className="relative overflow-hidden rounded-[20px] bg-surface-muted p-[28px]">
            <div className="flex items-stretch gap-[24px]">
              <FreePromoBanner />
              {freeListings.length > 0 ? (
                <FreeGiveawayCarousel listings={freeListings} />
              ) : (
                <div
                  className="flex shrink-0 items-center justify-center rounded-[20px] bg-white/80 px-[24px] text-center text-[16px] font-semibold text-text-secondary"
                  style={{ width: `${CAROUSEL_VISIBLE_WIDTH}px` }}
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
