"use client";

import { ListingCardSkeleton, useFreeListings } from "@/entities/listing";

import { FreeGiveawayCarousel } from "./FreeGiveawayCarousel";
import { FreePromoBanner } from "./FreePromoBanner";

export function HomeFreeGiveawaySection() {
  const { items: freeListings, isLoading } = useFreeListings(8);

  return (
    <section className="home-free-section bg-surface pb-[68px] pt-[68px] text-brand">
      <div className="home-free-section__inner">
        <div className="home-free-section__stack">
          <h2 className="home-free-section__heading">
            Отдают <span className="text-[#8E8BED]">даром</span>
          </h2>

          <div className="home-free-section__panel">
            <div className="home-free-section__row">
              <FreePromoBanner />
              {isLoading ? (
                <div
                  className="home-free-section__carousel-slot"
                  aria-busy="true"
                  aria-label="Загрузка объявлений даром"
                >
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="home-free-carousel__item shrink-0">
                      <ListingCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : freeListings.length > 0 ? (
                <FreeGiveawayCarousel listings={freeListings} />
              ) : (
                <div className="home-free-section__empty">
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
