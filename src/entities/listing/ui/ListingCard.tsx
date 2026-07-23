/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { HeartIcon, TagsIcon } from "@/shared/ui/icons";

import type { ListingCardVariant } from "../model/types";

const WANTS_MIN_VISIBLE = 2;
const WANTS_MAX_VISIBLE = 3;
const WANTS_MAX_CHARS = 18;
const WANTS_PILL_GAP = 8;
/** Content area for pills: 321 - paddings - icon - gap. */
const WANTS_PILLS_AVAILABLE_FALLBACK = 252;

function truncateWantLabel(label: string) {
  const normalized = label.trim();
  if (normalized.length <= WANTS_MAX_CHARS) return normalized;
  return `${normalized.slice(0, WANTS_MAX_CHARS).trimEnd()}...`;
}

export type ListingCardProps = {
  listingId: string;
  variant: ListingCardVariant;
  title: string;
  city: string;
  condition: string;
  coverImageUrl?: string | null;
  wants?: string[];
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
  isFavorite = false,
  className,
}: ListingCardProps) {
  const { guardAuth } = useAuthGate();
  const favoriteMutation = useFavoriteToggle();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const favorite = favoriteOverride ?? isFavorite;
  const showWants = variant === "exchange";
  const listingHref = `/listings/${listingId}`;
  const truncatedWants = useMemo(
    () =>
      wants.map((item) => ({
        full: item,
        label: truncateWantLabel(item),
      })),
    [wants],
  );
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(WANTS_MAX_VISIBLE, truncatedWants.length),
  );
  const rootClassName = [
    "home-listing-card",
    variant === "hero" ? "home-listing-card--hero" : "",
    variant === "free" ? "home-listing-card--free" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    if (!showWants || truncatedWants.length === 0) {
      setVisibleCount(0);
      return;
    }

    const syncVisibleCount = () => {
      const pillsEl = pillsRef.current;
      const measureEl = measureRef.current;
      if (!pillsEl || !measureEl) return;

      const availableWidth =
        pillsEl.clientWidth > 40 ? pillsEl.clientWidth : WANTS_PILLS_AVAILABLE_FALLBACK;
      const measurePills = Array.from(
        measureEl.querySelectorAll<HTMLElement>("[data-want-measure-pill]"),
      );
      const maxCandidates = Math.min(WANTS_MAX_VISIBLE, measurePills.length);
      const minVisible = Math.min(WANTS_MIN_VISIBLE, truncatedWants.length);

      let nextCount = 0;
      let usedWidth = 0;

      for (let index = 0; index < maxCandidates; index += 1) {
        const pillWidth = measurePills[index]?.offsetWidth ?? 0;
        const nextWidth = index === 0 ? pillWidth : usedWidth + WANTS_PILL_GAP + pillWidth;
        if (nextWidth > availableWidth) break;
        usedWidth = nextWidth;
        nextCount = index + 1;
      }

      setVisibleCount(Math.min(maxCandidates, Math.max(nextCount, minVisible)));
    };

    syncVisibleCount();
    const frameId = window.requestAnimationFrame(syncVisibleCount);
    return () => window.cancelAnimationFrame(frameId);
  }, [showWants, truncatedWants]);

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
  const visibleWants = truncatedWants.slice(0, visibleCount);
  const wantsMore = Math.max(wants.length - visibleCount, 0);

  return (
    <article className={rootClassName}>
      <div className="home-listing-card__title">
        <Link href={listingHref} className="home-listing-card__title-link">
          <span>{title}</span>
        </Link>
      </div>

      <div className="home-listing-card__media">
        <Link href={listingHref} className="home-listing-card__media-link" aria-label={title}>
          <img
            src={coverImageUrl || LISTING_PLACEHOLDER_IMAGE}
            alt=""
            className="home-listing-card__image"
          />
        </Link>
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
            <div ref={pillsRef} className="home-listing-card__wants-pills">
              {visibleWants.map((item) => (
                <span
                  key={item.full}
                  className="home-listing-card__want-pill"
                  title={item.full !== item.label ? item.full : undefined}
                >
                  {item.label}
                </span>
              ))}
            </div>
            {wantsMore > 0 ? (
              <span className="home-listing-card__wants-more">+{wantsMore}</span>
            ) : null}
            <div
              ref={measureRef}
              className="home-listing-card__wants-measure"
              aria-hidden="true"
            >
              {truncatedWants.slice(0, WANTS_MAX_VISIBLE).map((item) => (
                <span key={item.full} data-want-measure-pill className="home-listing-card__want-pill">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
