"use client";

import { ListingCard, type ListingCardData } from "@/entities/listing";

function HeroRecommendationsEmpty({
  isExchange,
  isAllCategory,
}: {
  isExchange: boolean;
  isAllCategory: boolean;
}) {
  return (
    <div className="flex min-h-[427px] w-[342px] flex-col items-center justify-center rounded-[10px] bg-white px-[24px] py-[32px] text-center shadow-[0px_5px_4.95px_rgba(0,0,0,0.25)]">
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
    <div className="flex min-h-[427px] w-[342px] items-center justify-center rounded-[10px] bg-white/90 px-[24px] text-center text-[14px] font-medium text-[#626262] shadow-[0px_5px_4.95px_rgba(0,0,0,0.12)]">
      Подбираем объявления...
    </div>
  );
}

type HeroRecommendationsPanelProps = {
  heading: string;
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
  return (
    <div className="relative h-full w-[454px] rounded-[10px] bg-[#C8FF00] p-[8px]">
      <div className="mx-auto mb-[8px] mt-[8px] w-[342px] text-left text-[#1A1A1A]">
        <p className="text-[16px] font-bold leading-[1.2]">{heading}</p>
      </div>
      <div className="home-recommendations-scroll mx-auto h-[479px] w-[358px] overflow-y-auto overflow-x-hidden rounded-[10px] p-[8px] snap-y snap-mandatory overscroll-contain">
        <div className="flex flex-col items-center gap-[16px]">
          {loading ? (
            <HeroRecommendationsLoading />
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <div key={listing.id} data-recommendation-card className="flex w-full snap-center snap-always justify-center">
                <ListingCard
                  variant="hero"
                  title={listing.title}
                  city={listing.city}
                  condition={listing.condition}
                  coverImageUrl={listing.coverImageUrl}
                  wants={listing.wants}
                  wantsMore={listing.wantsMore}
                />
              </div>
            ))
          ) : (
            <HeroRecommendationsEmpty isExchange={isExchange} isAllCategory={isAllCategory} />
          )}
        </div>
      </div>
    </div>
  );
}
