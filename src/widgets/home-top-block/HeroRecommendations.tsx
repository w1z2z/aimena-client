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
    <div className="flex h-[443px] w-[342px] flex-col items-center justify-center rounded-[31px] bg-white px-[24px] py-[32px] text-center">
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
    <div className="flex h-[443px] w-[342px] items-center justify-center rounded-[31px] bg-white/90 px-[24px] text-center text-[14px] font-medium text-[#626262]">
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
    <div className="relative flex h-[535px] w-[464px] flex-col items-start gap-[12px] rounded-[31px] bg-[#C8FF00] p-[24px]">
      <div className="w-[330px] text-left text-[#1A1A1A]">
        <p className="text-[24px] font-extrabold leading-[110%] tracking-[-0.003em]">{heading}</p>
      </div>

      <div className="home-recommendations-scroll mx-auto h-[461px] w-[366px] overflow-x-hidden overflow-y-auto overscroll-contain px-[12px] pb-[16px] pt-[2px] snap-y snap-mandatory">
        <div className="flex flex-col items-center gap-[16px]">
          {loading ? (
            <HeroRecommendationsLoading />
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <div
                key={listing.id}
                data-recommendation-card
                className="flex h-[443px] w-[342px] shrink-0 snap-center snap-always justify-center"
              >                <ListingCard
                  listingId={listing.id}
                  variant="hero"
                  title={listing.title}
                  city={listing.city}
                  condition={listing.condition}
                  coverImageUrl={listing.coverImageUrl}
                  wants={listing.wants}
                  wantsMore={listing.wantsMore}
                  isFavorite={listing.isFavorite}
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
