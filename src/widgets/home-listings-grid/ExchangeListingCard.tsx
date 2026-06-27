/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuthGate } from "@/features/auth";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { HeartIcon, TagsIcon } from "@/shared/ui/icons";

const imgListingPhoto = LISTING_PLACEHOLDER_IMAGE;

export type ExchangeListingCardData = {
  id: string;
  title: string;
  city: string;
  condition: string;
  wants: string[];
  wantsMore: number;
  coverImageUrl?: string | null;
};

export function ExchangeListingCard({
  title,
  city,
  condition,
  wants,
  wantsMore,
  coverImageUrl,
}: Omit<ExchangeListingCardData, "id">) {
  const { guardAuth } = useAuthGate();

  const handleFavoriteClick = () => {
    guardAuth("favorites");
  };

  const handleExchangeClick = () => {
    guardAuth("propose-exchange");
  };

  return (
    <article className="home-listing-card">
      <div className="home-listing-card__title">{title}</div>

      <div className="home-listing-card__media">
        <img src={coverImageUrl || imgListingPhoto} alt="" className="home-listing-card__image" />
        <button
          type="button"
          aria-label="Добавить в избранное"
          className="home-listing-card__favorite"
          onClick={handleFavoriteClick}
        >
          <HeartIcon className="h-[14px] w-[16px] text-[#626262]" />
        </button>
        <div className="home-listing-card__tags">
          <span className="home-listing-card__tag">{city}</span>
          <span className="home-listing-card__tag">{condition}</span>
        </div>
      </div>

      <div className="home-listing-card__footer">
        <button type="button" className="home-listing-card__action" onClick={handleExchangeClick}>
          Быстрый обмен
        </button>

        <div className="home-listing-card__wants">
          <TagsIcon className="home-listing-card__wants-icon" aria-hidden="true" />
          {wants.map((item) => (
            <span key={item} className="home-listing-card__want-pill">
              {item}
            </span>
          ))}
          {wantsMore > 0 ? (
            <span className="home-listing-card__wants-more">+{wantsMore}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
