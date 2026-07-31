/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuth, useAuthGate } from "@/features/auth";
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
  /** Free listing — footer shows a single «даром» tag instead of wants. */
  isFree?: boolean;
  isFavorite?: boolean;
  /** Listing owner — used to hide favorite on own cards. */
  ownerId?: string | null;
  /** Own-profile status label (e.g. «Активно»). */
  status?: string | null;
  /** Greyscale cover (e.g. unpublished / archived). */
  imageMuted?: boolean;
  /** Optional control in the title row (e.g. owner actions menu). */
  titleAccessory?: ReactNode;
  /** Hide CTA like «Быстрый обмен» (e.g. own profile listings). */
  hideAction?: boolean;
  /** Force-hide favorite (e.g. own profile without waiting for ownerId). */
  hideFavorite?: boolean;
  /** Listing is no longer publicly available — overlay + no navigation. */
  unavailable?: boolean;
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
  isFree = false,
  isFavorite = false,
  ownerId,
  status,
  imageMuted = false,
  titleAccessory,
  hideAction = false,
  hideFavorite = false,
  unavailable = false,
  className,
}: ListingCardProps) {
  const { user } = useAuth();
  const { guardAuth } = useAuthGate();
  const favoriteMutation = useFavoriteToggle();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const favorite = favoriteOverride ?? isFavorite;
  const isOwnListing =
    hideFavorite || Boolean(user?.id && ownerId && user.id === ownerId);
  const freeListing = isFree || variant === "free";
  const showWants = variant === "exchange" || variant === "mine";
  const listingHref = `/listings/${listingId}`;
  const truncatedWants = useMemo(() => {
    if (freeListing) {
      return [{ full: "Даром", label: "Даром" }];
    }
    return wants.map((item) => ({
      full: item,
      label: truncateWantLabel(item),
    }));
  }, [freeListing, wants]);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(WANTS_MAX_VISIBLE, truncatedWants.length),
  );
  const rootClassName = [
    "home-listing-card",
    variant === "hero" ? "home-listing-card--hero" : "",
    variant === "free" ? "home-listing-card--free" : "",
    variant === "mine" ? "home-listing-card--mine" : "",
    imageMuted || unavailable ? "home-listing-card--muted" : "",
    unavailable ? "home-listing-card--unavailable" : "",
    titleAccessory ? "home-listing-card--has-title-accessory" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Drop optimistic override only once the parent prop catches up (cache update).
  useEffect(() => {
    if (favoriteOverride !== null && favoriteOverride === isFavorite) {
      setFavoriteOverride(null);
    }
  }, [favoriteOverride, isFavorite]);

  useLayoutEffect(() => {
    if (!showWants || freeListing || truncatedWants.length === 0) {
      setVisibleCount(freeListing ? 1 : 0);
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
  }, [showWants, freeListing, truncatedWants]);

  const handleFavoriteClick = () => {
    if (isOwnListing || favoriteMutation.isPending || favoriteOverride !== null) return;

    guardAuth("favorites", () => {
      const previous = favorite;
      setFavoriteOverride(!previous);
      favoriteMutation.mutate(
        { listingId, isFavorite: previous },
        {
          onError: () => setFavoriteOverride(null),
        },
      );
    });
  };

  const handleExchangeClick = () => {
    guardAuth("propose-exchange");
  };

  const actionLabel = freeListing ? "Отдаю даром" : "Быстрый обмен";
  const actionHandler = unavailable ? undefined : handleExchangeClick;
  const hideFooterAction = hideAction;
  const hasWants = truncatedWants.length > 0;
  const visibleWants = truncatedWants.slice(0, visibleCount);
  const wantsMore = freeListing ? 0 : Math.max(wants.length - visibleCount, 0);

  const titleNode = unavailable ? (
    <span className="home-listing-card__title-link">
      <span>{title}</span>
    </span>
  ) : (
    <Link href={listingHref} className="home-listing-card__title-link">
      <span>{title}</span>
    </Link>
  );

  const mediaNode = (
    <>
      <img
        src={coverImageUrl || LISTING_PLACEHOLDER_IMAGE}
        alt=""
        className="home-listing-card__image"
      />
      {unavailable ? (
        <div className="home-listing-card__unavailable" aria-hidden="true">
          <span>Объявление больше недоступно</span>
        </div>
      ) : null}
    </>
  );

  return (
    <article className={rootClassName}>
      <div className="home-listing-card__title">
        {titleNode}
        {titleAccessory ? (
          <div className="home-listing-card__title-accessory">{titleAccessory}</div>
        ) : null}
      </div>

      <div className="home-listing-card__media">
        {unavailable ? (
          <div className="home-listing-card__media-link" aria-label={title}>
            {mediaNode}
          </div>
        ) : (
          <Link href={listingHref} className="home-listing-card__media-link" aria-label={title}>
            {mediaNode}
          </Link>
        )}
        {isOwnListing ? null : (
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
        )}
        {unavailable ? null : (
          <div className="home-listing-card__tags">
            {status ? (
              <span className="home-listing-card__tag home-listing-card__tag--status">{status}</span>
            ) : null}
            <span className="home-listing-card__tag">{city}</span>
            <span className="home-listing-card__tag">{condition}</span>
          </div>
        )}
      </div>

      <div className="home-listing-card__footer">
        {hideFooterAction ? null : (
          <button
            type="button"
            className={[
              "home-listing-card__action",
              freeListing ? "home-listing-card__action--free" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={actionHandler}
            disabled={unavailable}
            aria-disabled={unavailable}
          >
            {actionLabel}
          </button>
        )}

        {showWants ? (
          <div className="home-listing-card__wants">
            <TagsIcon className="home-listing-card__wants-icon" aria-hidden="true" />
            {hasWants ? (
              <>
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
                    <span
                      key={item.full}
                      data-want-measure-pill
                      className="home-listing-card__want-pill"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="home-listing-card__wants-pills">
                <span className="home-listing-card__want-pill">Любые варианты</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
