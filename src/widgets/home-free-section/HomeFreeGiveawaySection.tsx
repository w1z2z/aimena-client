/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useAuthGate } from "@/features/auth";
import { HeartIcon } from "@/shared/ui/icons";

const imgListingPhoto =
  "https://www.figma.com/api/mcp/asset/03e5747b-db77-495a-a0bc-3d74a40d9e94";
const imgPromoBlob = "https://www.figma.com/api/mcp/asset/196fe5fd-b85d-4179-8afd-49cfb69c895e";

const freeListings = [
  { id: 1, title: 'MacBook Pro 14" M3 Хо', city: "Москва", condition: "Хорошее" },
  { id: 2, title: 'MacBook Pro 14" M3 Хо', city: "Москва", condition: "Хорошее" },
  { id: 3, title: 'MacBook Pro 14" M3 Хо', city: "Москва", condition: "Хорошее" },
  { id: 4, title: 'MacBook Pro 14" M3 Хо', city: "Москва", condition: "Хорошее" },
  { id: 5, title: 'MacBook Pro 14" M3 Хо', city: "Москва", condition: "Хорошее" },
];

const CARD_WIDTH = 342;
const CARD_GAP = 24;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARD_COUNT = 2;
const CAROUSEL_SCROLL_END_FALLBACK_MS = 150;

function getCarouselSetWidth(itemCount: number) {
  if (itemCount <= 0) return 0;
  return itemCount * CARD_STEP;
}
const SECTION_WIDTH = 1441;
const PANEL_PADDING = 28;
const CAROUSEL_VISIBLE_WIDTH = CARD_WIDTH * VISIBLE_CARD_COUNT + CARD_GAP;
const PROMO_WIDTH = SECTION_WIDTH - PANEL_PADDING * 2 - CAROUSEL_VISIBLE_WIDTH - CARD_GAP;

const PROMO_BLOB_LEFT = Math.round((306 / 660) * PROMO_WIDTH);

function FreePromoBanner() {
  return (
    <div
      className="relative flex shrink-0 flex-col overflow-clip rounded-[10px] bg-white p-[48px]"
      style={{ width: `${PROMO_WIDTH}px` }}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-[24px]">
          <h3 className="h-[31px] text-[40px] font-bold leading-[40px] tracking-[-0.2px] text-[#1A1A1A]">
            Всё даром
          </h3>
          <p className="max-w-[560px] text-[18px] font-semibold leading-[1.2] tracking-[-0.036px] text-[#3D3D3D]">
            Люди отдают всё что угодно. Просто так.
          </p>
        </div>
        <button
          type="button"
          className="box-border flex h-[48px] w-[225px] shrink-0 items-center justify-center gap-[6px] rounded-[10px] border border-[#8E8BED] border-[0.5px] bg-[#8E8BED] px-[24px] py-[16px] transition hover:brightness-105 active:translate-y-[0.5px]"
        >
          <span className="flex h-[16px] w-[177px] items-center justify-center text-center text-[16px] font-bold leading-[20px] tracking-[0.001em] text-[#F8F8F5]">
            Посмотреть
          </span>
        </button>
      </div>
      <div
        className="pointer-events-none absolute top-0 size-[636px]"
        style={{ left: `${PROMO_BLOB_LEFT}px` }}
      >
        <div className="absolute inset-[7.98%]">
          <img src={imgPromoBlob} alt="" className="block h-full w-full max-w-none object-contain" />
        </div>
      </div>
    </div>
  );
}

function FreeGiveawayCard({
  title,
  city,
  condition,
}: {
  title: string;
  city: string;
  condition: string;
}) {
  const { guardAuth } = useAuthGate();

  const handleFavoriteClick = () => {
    guardAuth("favorites");
  };

  return (
    <article className="w-[342px] shrink-0 rounded-[10px] bg-white py-[12px] shadow-[0px_0px_4.95px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex h-[29px] w-[318px] items-center justify-center text-[18px] font-semibold tracking-[-0.036px] text-[#1A1A1A]">
        {title}
      </div>
      <div className="relative mt-[12px] h-[342px] w-[342px] overflow-hidden">
        <img src={imgListingPhoto} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          aria-label="Добавить в избранное"
          className="absolute right-[11px] top-[10px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition hover:bg-white"
          onClick={handleFavoriteClick}
        >
          <HeartIcon className="h-[14px] w-[16px] text-[#626262]" />
        </button>
        <div className="absolute bottom-[9px] left-[8px] flex gap-[6px]">
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/73 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            {city}
          </span>
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/73 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            {condition}
          </span>
        </div>
      </div>
      <div className="mt-[12px] flex justify-center px-[10px]">
        <button
          type="button"
          className="flex h-[36px] w-[322px] items-center justify-center rounded-[10px] bg-[#8E8BED] text-[14px] font-semibold leading-none text-white transition hover:brightness-105 active:translate-y-[0.5px]"
        >
          Отдаю даром
        </button>
      </div>
    </article>
  );
}

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
        viewBox="0 0 16 26"
        fill="none"
        aria-hidden
        className={`h-[25px] w-[15px] ${isLeft ? "scale-x-[-1]" : ""}`}
      >
        <path
          d="M1 1L14 13L1 25"
          stroke="#1A1A1A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function FreeGiveawayCarousel({ listings }: { listings: typeof freeListings }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const itemCount = listings.length;
  const setWidth = getCarouselSetWidth(itemCount);
  const loopListings = useMemo(
    () => [...listings, ...listings, ...listings],
    [listings],
  );

  const normalizeScrollPosition = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || setWidth <= 0) return;

    let nextScrollLeft = Math.round(carousel.scrollLeft / CARD_STEP) * CARD_STEP;

    if (nextScrollLeft >= setWidth * 2) {
      nextScrollLeft -= setWidth;
    } else if (nextScrollLeft < setWidth) {
      nextScrollLeft += setWidth;
    }

    if (nextScrollLeft !== carousel.scrollLeft) {
      carousel.scrollLeft = nextScrollLeft;
    }
  }, [setWidth]);

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollLeft = setWidth;
  }, [setWidth]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScrollEnd = () => {
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }

      isProgrammaticScrollRef.current = false;
      normalizeScrollPosition();
    };

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }

      scrollEndTimerRef.current = window.setTimeout(() => {
        scrollEndTimerRef.current = null;
        isProgrammaticScrollRef.current = false;
        normalizeScrollPosition();
      }, CAROUSEL_SCROLL_END_FALLBACK_MS);
    };

    carousel.addEventListener("scrollend", handleScrollEnd);
    carousel.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      carousel.removeEventListener("scrollend", handleScrollEnd);
      carousel.removeEventListener("scroll", handleScroll);
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [normalizeScrollPosition]);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const carousel = carouselRef.current;
      if (!carousel || itemCount <= 0) return;

      isProgrammaticScrollRef.current = true;

      const currentIndex = Math.round(carousel.scrollLeft / CARD_STEP);
      const targetScrollLeft = (currentIndex + direction) * CARD_STEP;

      carousel.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    },
    [itemCount],
  );

  return (
    <div
      className="home-free-carousel-viewport relative shrink-0 overflow-hidden rounded-[20px]"
      style={{ width: `${CAROUSEL_VISIBLE_WIDTH}px` }}
    >
      <div
        ref={carouselRef}
        className="home-free-carousel flex snap-x snap-mandatory gap-[24px] overflow-x-auto overscroll-x-contain"
      >
        {loopListings.map((listing, index) => (
          <div
            key={`${listing.id}-${index}`}
            className="w-[342px] shrink-0 snap-start snap-always"
          >
            <FreeGiveawayCard
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
            />
          </div>
        ))}
      </div>
      <CarouselArrowButton direction="left" onClick={() => scrollByStep(-1)} />
      <CarouselArrowButton direction="right" onClick={() => scrollByStep(1)} />
    </div>
  );
}

export function HomeFreeGiveawaySection() {
  return (
    <section className="bg-[#F8F8F5] pb-[68px] pt-[68px] text-[#1A1A1A]">
      <div className="mx-auto w-full max-w-[1441px]">
        <div className="flex flex-col gap-[68px]">
          <h2 className="text-[40px] font-bold leading-[40px] tracking-[-0.2px]">
            Отдаю <span className="text-[#8E8BED]">даром</span>
          </h2>

          <div className="relative overflow-hidden rounded-[20px] bg-[#F0E8FF] p-[28px]">
            <div className="flex items-stretch gap-[24px]">
              <FreePromoBanner />
              <FreeGiveawayCarousel listings={freeListings} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
