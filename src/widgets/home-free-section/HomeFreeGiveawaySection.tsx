"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { ListingCardSkeleton, useFreeListings } from "@/entities/listing";
import { MQ } from "@/shared/lib/breakpoints";
import { useMediaQuery } from "@/shared/lib/use-media-query";

import { PANEL_HEIGHT, PANEL_WIDTH } from "./constants";
import { FreeGiveawayCarousel } from "./FreeGiveawayCarousel";
import { FreePromoBanner } from "./FreePromoBanner";

/**
 * Same behaviour as the home hero desktop scene:
 * - above tablet: keep the Figma desktop panel intact and scale it as a whole
 * - at tablet and below: existing stacked mobile CSS takes over (no scale)
 */
export function HomeFreeGiveawaySection() {
  const { items: freeListings, isLoading } = useFreeListings(8);
  const isMobileLayout = useMediaQuery(MQ.tablet);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const needsScale = !isMobileLayout && scale < 1;

  useLayoutEffect(() => {
    if (isMobileLayout) {
      setScale(1);
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    const updateScale = () => {
      const width = host.clientWidth;
      if (width <= 0) return;
      setScale(Math.min(1, width / PANEL_WIDTH));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(host);
    return () => observer.disconnect();
  }, [isMobileLayout]);

  const listingsBody = isLoading ? (
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
  );

  return (
    <section className="home-free-section bg-surface pb-[68px] pt-[68px] text-brand">
      <div className="home-free-section__inner">
        <div className="home-free-section__stack">
          <h2 className="home-free-section__heading">
            Отдают <span className="text-[#8E8BED]">даром</span>
          </h2>

          <div ref={hostRef} className="home-free-section__panel-host">
            <div
              className="home-free-section__panel-scale"
              style={
                needsScale
                  ? {
                      width: `${PANEL_WIDTH * scale}px`,
                      height: `${PANEL_HEIGHT * scale}px`,
                      marginInline: "auto",
                    }
                  : undefined
              }
            >
              <div
                className={`home-free-section__panel${needsScale ? " is-scaled" : ""}`}
                style={
                  needsScale
                    ? {
                        width: `${PANEL_WIDTH}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                      }
                    : undefined
                }
              >
                <div className="home-free-section__row">
                  <FreePromoBanner />
                  {listingsBody}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
