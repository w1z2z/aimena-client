/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuth, useAuthGate } from "@/features/auth";
import { useFavoriteToggle } from "@/features/favorites";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { HeartIcon, LocationPinIcon, SwapIcon } from "@/shared/ui/icons";

import {
  LISTING_LIFECYCLE_MESSAGE,
  type ListingCardLifecycle,
  type ListingCardVariant,
} from "../model/types";

const WANTS_MIN_VISIBLE = 2;
const WANTS_MAX_VISIBLE = 3;
const WANTS_MAX_CHARS = 18;
const WANTS_PILL_GAP = 8;
const WANTS_PILLS_AVAILABLE_FALLBACK = 220;
const WANT_CATEGORIES_MAX = 3;

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
  wantCategories?: string[];
  isFree?: boolean;
  isFavorite?: boolean;
  ownerId?: string | null;
  /** Inactive footer state (archive / completed / deleted). */
  lifecycle?: ListingCardLifecycle | null;
  imageMuted?: boolean;
  titleAccessory?: ReactNode;
  /** Hide swap badge (own listings). */
  hideAction?: boolean;
  hideFavorite?: boolean;
  unavailable?: boolean;
  className?: string;
};

export function ListingCard({
  listingId,
  variant,
  title,
  city,
  coverImageUrl,
  wants = [],
  wantCategories = [],
  isFree = false,
  isFavorite = false,
  ownerId,
  lifecycle = null,
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
  const inactiveLifecycle =
    lifecycle ?? (unavailable ? ("deleted" as const) : null);
  const isInactive = Boolean(inactiveLifecycle);
  const isDeleted = inactiveLifecycle === "deleted";
  const showSwapBadge = !hideAction && !isOwnListing && !isInactive && variant !== "mine";
  const showWantsPanel = !isInactive;
  const listingHref = `/listings/${listingId}`;
  const canOpenListing = !isDeleted;

  const categories = useMemo(() => {
    if (freeListing) return ["Даром"];
    return wantCategories.slice(0, WANT_CATEGORIES_MAX);
  }, [freeListing, wantCategories]);

  const truncatedWants = useMemo(() => {
    if (freeListing) return [];
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
    variant === "free" || freeListing ? "home-listing-card--free" : "",
    variant === "mine" ? "home-listing-card--mine" : "",
    imageMuted || isInactive ? "home-listing-card--muted" : "",
    inactiveLifecycle ? `home-listing-card--${inactiveLifecycle}` : "",
    titleAccessory ? "home-listing-card--has-title-accessory" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (favoriteOverride !== null && favoriteOverride === isFavorite) {
      setFavoriteOverride(null);
    }
  }, [favoriteOverride, isFavorite]);

  useLayoutEffect(() => {
    if (!showWantsPanel || freeListing || truncatedWants.length === 0) {
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
      const moreReserve =
        truncatedWants.length > minVisible ? 24 + WANTS_PILL_GAP : 0;

      let nextCount = 0;
      let usedWidth = 0;

      for (let index = 0; index < maxCandidates; index += 1) {
        const pillWidth = measurePills[index]?.offsetWidth ?? 0;
        const nextWidth = index === 0 ? pillWidth : usedWidth + WANTS_PILL_GAP + pillWidth;
        const remaining = truncatedWants.length - (index + 1);
        const widthBudget =
          remaining > 0 ? availableWidth - moreReserve : availableWidth;
        if (nextWidth > widthBudget) break;
        usedWidth = nextWidth;
        nextCount = index + 1;
      }

      setVisibleCount(Math.min(maxCandidates, Math.max(nextCount, minVisible)));
    };

    syncVisibleCount();
    const frameId = window.requestAnimationFrame(syncVisibleCount);
    return () => window.cancelAnimationFrame(frameId);
  }, [showWantsPanel, freeListing, truncatedWants]);

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
    if (isInactive) return;
    guardAuth("propose-exchange");
  };

  const visibleWants = truncatedWants.slice(0, visibleCount);
  const wantsMore = freeListing ? 0 : Math.max(wants.length - visibleCount, 0);
  const lifecycleMessage = inactiveLifecycle
    ? LISTING_LIFECYCLE_MESSAGE[inactiveLifecycle]
    : null;

  const titleNode = canOpenListing ? (
    <Link href={listingHref} className="home-listing-card__title-link">
      <span>{title}</span>
    </Link>
  ) : (
    <span className="home-listing-card__title-link">
      <span>{title}</span>
    </span>
  );

  const mediaInner = (
    <img
      src={coverImageUrl || LISTING_PLACEHOLDER_IMAGE}
      alt=""
      className="home-listing-card__image"
    />
  );

  return (
    <article className={rootClassName}>
      <div className="home-listing-card__title">{titleNode}</div>

      <div className="home-listing-card__body">
        <div className="home-listing-card__media">
          {canOpenListing ? (
            <Link href={listingHref} className="home-listing-card__media-link" aria-label={title}>
              {mediaInner}
            </Link>
          ) : (
            <div className="home-listing-card__media-link" aria-label={title}>
              {mediaInner}
            </div>
          )}

          {titleAccessory ? (
            <div className="home-listing-card__media-accessory">{titleAccessory}</div>
          ) : isOwnListing || isInactive ? null : (
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

          <div className="home-listing-card__location">
            <LocationPinIcon className="home-listing-card__location-icon" />
            <span>{city}</span>
          </div>
        </div>

        <div className="home-listing-card__footer">
          <div className="home-listing-card__footer-inner">
            {lifecycleMessage ? (
              <>
                <p className="home-listing-card__lifecycle">{lifecycleMessage}</p>
                <div className="home-listing-card__divider" aria-hidden="true" />
              </>
            ) : (
              <>
                <div className="home-listing-card__exchange-row">
                  <span className="home-listing-card__exchange-label">Обмен на:</span>
                  {categories.length > 0 ? (
                    <div className="home-listing-card__categories">
                      {categories.map((category) => (
                        <span key={category} className="home-listing-card__category" title={category}>
                          <span className="home-listing-card__category-text">{category}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="home-listing-card__category" title="Любые варианты">
                      <span className="home-listing-card__category-text">Любые варианты</span>
                    </span>
                  )}
                </div>

                <div className="home-listing-card__divider" aria-hidden="true" />

                {freeListing ? (
                  <div className="home-listing-card__wants-row home-listing-card__wants-row--free">
                    <span className="home-listing-card__free-pill">Отдается даром</span>
                  </div>
                ) : (
                  <div className="home-listing-card__wants-row">
                    {truncatedWants.length > 0 ? (
                      <>
                        <div ref={pillsRef} className="home-listing-card__wants-pills">
                          {visibleWants.map((item) => (
                            <span
                              key={item.full}
                              className="home-listing-card__want-pill"
                              title={item.full !== item.label ? item.full : undefined}
                            >
                              <span className="home-listing-card__want-pill-text">{item.label}</span>
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
                              <span className="home-listing-card__want-pill-text">{item.label}</span>
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="home-listing-card__want-pill">
                        <span className="home-listing-card__want-pill-text">Любые варианты</span>
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showSwapBadge ? (
          <button
            type="button"
            className="home-listing-card__swap"
            aria-label={freeListing ? "Отдаю даром" : "Быстрый обмен"}
            onClick={handleExchangeClick}
          >
            <SwapIcon className="home-listing-card__swap-icon" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
