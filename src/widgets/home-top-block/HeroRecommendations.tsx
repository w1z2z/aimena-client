"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { ListingCard, ListingCardSkeleton, type ListingCardData } from "@/entities/listing";

function HeroRecommendationsEmpty({
  isExchange,
  isAllCategory,
}: {
  isExchange: boolean;
  isAllCategory: boolean;
}) {
  return (
    <div
      className="box-border flex h-[458px] w-[342px] flex-col items-center justify-center rounded-[31px] border-[3px] border-solid border-transparent px-[24px] py-[32px] text-center"
      style={{
        background:
          "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
      }}
    >
      <p className="text-[18px] font-semibold text-[#1A1A1A]">Нет подходящих вариантов</p>
      <p className="mt-[8px] text-[14px] leading-[1.35] text-[#626262]">
        {isAllCategory
          ? "Сейчас активных объявлений нет — загляните позже или откройте полный список."
          : isExchange
            ? "Попробуйте другое название, город или категорию."
            : "Измените фильтры или выберите другую категорию."}
      </p>
    </div>
  );
}

function HeroRecommendationsLoading() {
  return <ListingCardSkeleton />;
}

type HeroRecommendationsPanelProps = {
  heading: ReactNode;
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
};

type DisplayedRecommendations = {
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
};

export function HeroRecommendationsPanel({
  heading,
  loading,
  listings,
  isExchange,
  isAllCategory,
}: HeroRecommendationsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState<DisplayedRecommendations>({
    loading,
    listings,
    isExchange,
    isAllCategory,
  });
  const isFirstModeRender = useRef(true);
  const latestPropsRef = useRef({ loading, listings, isExchange, isAllCategory });
  latestPropsRef.current = { loading, listings, isExchange, isAllCategory };

  useLayoutEffect(() => {
    if (isFirstModeRender.current) {
      isFirstModeRender.current = false;
      return;
    }

    setVisible(false);
    const swapTimer = window.setTimeout(() => {
      setDisplayed(latestPropsRef.current);
      window.requestAnimationFrame(() => setVisible(true));
    }, 280);

    return () => window.clearTimeout(swapTimer);
  }, [isExchange]);

  useLayoutEffect(() => {
    if (!visible || displayed.isExchange !== isExchange) return;
    setDisplayed({ loading, listings, isExchange, isAllCategory });
  }, [visible, loading, listings, isExchange, isAllCategory, displayed.isExchange]);

  const scrollKey = displayed.loading
    ? "loading"
    : displayed.listings.length > 0
      ? displayed.listings.map((item) => item.id).join("-")
      : "empty";

  const [scrollSettling, setScrollSettling] = useState(true);

  // After list swap: disable snap, pin top once, re-enable (no scroll-fighting interval).
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !visible) return;

    setScrollSettling(true);
    node.scrollTop = 0;

    const settleTimer = window.setTimeout(() => {
      node.scrollTop = 0;
      setScrollSettling(false);
    }, 80);

    return () => window.clearTimeout(settleTimer);
  }, [scrollKey, visible]);

  return (
    <div className="relative flex h-[552px] w-[464px] flex-col items-center gap-[24px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <div className="flex h-[17px] w-[330px] shrink-0 items-center justify-center text-center text-[#1A1A1A]">
        <p className="text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
          {heading}
        </p>
      </div>

      <div
        key={scrollKey}
        ref={scrollRef}
        className={`home-recommendations-scroll min-h-0 w-[366px] flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-[12px] [overflow-anchor:none]${
          scrollSettling ? " is-scroll-settling" : ""
        }`}
      >
        <div
          className={`hero-recommendations-fade flex flex-col items-center gap-[16px] ${
            visible ? "is-visible" : "is-hidden"
          }`}
        >
          {displayed.loading ? (
            <HeroRecommendationsLoading />
          ) : displayed.listings.length > 0 ? (
            displayed.listings.map((listing) => (
              <div
                key={listing.id}
                data-recommendation-card
                className="flex h-[458px] w-[342px] shrink-0 justify-center"
              >
                <ListingCard
                  listingId={listing.id}
                  variant="hero"
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
            ))
          ) : (
            <HeroRecommendationsEmpty
              isExchange={displayed.isExchange}
              isAllCategory={displayed.isAllCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
