/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

import { useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { HeartIcon, TagsIcon } from "@/shared/ui/icons";

import type { ListingCardVariant } from "../model/types";

export type ListingCardProps = {
  listingId: string;
  variant: ListingCardVariant;
  title: string;
  city: string;
  condition: string;
  coverImageUrl?: string | null;
  wants?: string[];
  wantsMore?: number;
  isFavorite?: boolean;
  className?: string;
};

export function ListingCard({
  listingId,
  variant,
  title,
  city,
  condition,
  coverImageUrl,
  wants = [],
  wantsMore = 0,
  isFavorite = false,
  className,
}: ListingCardProps) {
  const { guardAuth } = useAuthGate();
  const favoriteMutation = useFavoriteToggle();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const favorite = favoriteOverride ?? isFavorite;
  const showWants = variant === "exchange";
  const rootClassName = [
    "home-listing-card",
    variant === "hero" ? "home-listing-card--hero" : "",
    variant === "free" ? "home-listing-card--free" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleFavoriteClick = () => {
    guardAuth("favorites", () => {
      const previous = favorite;
      setFavoriteOverride(!previous);
      favoriteMutation.mutate(
        { listingId, isFavorite: previous },
        {
          onSuccess: () => setFavoriteOverride(null),
          onError: () => setFavoriteOverride(null),
        },
      );
    });
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
        <button
          type="button"
          aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
          aria-pressed={favorite}
          className="home-listing-card__favorite"
          onClick={handleFavoriteClick}
          disabled={favoriteMutation.isPending}
        >
          <HeartIcon
            className={`h-[14px] w-[16px] ${favorite ? "text-[#FF2056]" : "text-[#626262]"}`}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
        <div className="home-listing-card__tags">
          <span className="home-listing-card__tag">{city}</span>
          <span className="home-listing-card__tag">{condition}</span>
        </div>
      </div>

      <div className="home-listing-card__footer">
        <button type="button" className="home-listing-card__action" onClick={actionHandler}>
          {actionLabel}
        </button>

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
