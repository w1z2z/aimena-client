/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuthGate } from "@/features/auth";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { HeartIcon, TagsIcon } from "@/shared/ui/icons";

import type { ListingCardVariant } from "../model/types";

export type ListingCardProps = {
  variant: ListingCardVariant;
  title: string;
  city: string;
  condition: string;
  coverImageUrl?: string | null;
  wants?: string[];
  wantsMore?: number;
  className?: string;
};

export function ListingCard({
  variant,
  title,
  city,
  condition,
  coverImageUrl,
  wants = [],
  wantsMore = 0,
  className,
}: ListingCardProps) {
  const { guardAuth } = useAuthGate();
  const showFavorite = variant !== "hero";
  const showWants = variant !== "free";
  const rootClassName = [
    "home-listing-card",
    variant === "hero" ? "home-listing-card--hero" : "",
    variant === "free" ? "home-listing-card--free" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleFavoriteClick = () => {
    guardAuth("favorites");
  };

  const handleExchangeClick = () => {
    guardAuth("propose-exchange");
  };

  const actionLabel = variant === "free" ? "Отдаю даром" : "Быстрый обмен";
  const actionHandler = variant === "free" ? undefined : handleExchangeClick;

  return (
    <article className={rootClassName}>
      <div className="home-listing-card__title">
        <span>{title}</span>
      </div>

      <div className="home-listing-card__media">
        <img
          src={coverImageUrl || LISTING_PLACEHOLDER_IMAGE}
          alt=""
          className="home-listing-card__image"
        />
        {showFavorite ? (
          <button
            type="button"
            aria-label="Добавить в избранное"
            className="home-listing-card__favorite"
            onClick={handleFavoriteClick}
          >
            <HeartIcon className="h-[14px] w-[16px] text-[#626262]" />
          </button>
        ) : null}
        <div className="home-listing-card__tags">
          <span className="home-listing-card__tag">{city}</span>
          <span className="home-listing-card__tag">{condition}</span>
        </div>
      </div>

      <div className="home-listing-card__footer">
        {variant !== "hero" ? (
          <button type="button" className="home-listing-card__action" onClick={actionHandler}>
            {actionLabel}
          </button>
        ) : null}

        {showWants ? (
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
        ) : null}
      </div>
    </article>
  );
}
