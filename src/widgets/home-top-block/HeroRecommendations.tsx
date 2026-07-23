"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { ListingCard, type ListingCardData } from "@/entities/listing";

function HeroRecommendationsEmpty({
  isExchange,
  isAllCategory,
}: {
  isExchange: boolean;
  isAllCategory: boolean;
}) {
  return (
    <div
      className="box-border flex h-[443px] w-[342px] flex-col items-center justify-center rounded-[31px] border-[0.3px] border-solid border-transparent px-[24px] py-[32px] text-center"
      style={{
        background:
          "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
      }}
    >
      <p className="text-[18px] font-semibold text-[#1A1A1A]">Пока ничего не нашли</p>
      <p className="mt-[8px] text-[14px] leading-[1.35] text-[#626262]">
        {isAllCategory
          ? "Сейчас нет активных объявлений. Загляните позже или откройте полный список."
          : isExchange
            ? "Попробуйте изменить название, город или категорию."
            : "Попробуйте ослабить параметры или выбрать другую категорию."}
      </p>
    </div>
  );
}

function HeroRecommendationsLoading() {
  return (
    <div
      className="box-border flex h-[443px] w-[342px] items-center justify-center rounded-[31px] border-[0.3px] border-solid border-transparent px-[24px] text-center text-[14px] font-medium text-[#626262]"
      style={{
        background:
          "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
      }}
    >
      Подбираем объявления...
    </div>
  );
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

  useEffect(() => {
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

  useEffect(() => {
    if (!visible || displayed.isExchange !== isExchange) return;
    setDisplayed({ loading, listings, isExchange, isAllCategory });
  }, [visible, loading, listings, isExchange, isAllCategory, displayed.isExchange]);

  return (
    <div className="relative flex h-[535px] w-[464px] flex-col items-center gap-[12px] rounded-[31px] bg-[#C8FF00] p-[24px]">
      <div className="w-[342px] shrink-0 text-left text-[#1A1A1A]">
        <p className="text-[24px] font-extrabold leading-[110%] tracking-[-0.003em]">{heading}</p>
      </div>

      <div className="home-recommendations-scroll h-[461px] w-[366px] overflow-x-hidden overflow-y-auto overscroll-contain px-[12px] pb-[16px] pt-[2px] snap-y snap-mandatory">
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
                className="flex h-[443px] w-[342px] shrink-0 snap-center snap-always justify-center"
              >
                <ListingCard
                  listingId={listing.id}
                  variant="hero"
                  title={listing.title}
                  city={listing.city}
                  condition={listing.condition}
                  coverImageUrl={listing.coverImageUrl}
                  wants={listing.wants}
                  isFavorite={listing.isFavorite}
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
