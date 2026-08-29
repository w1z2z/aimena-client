"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ListingWantCategory } from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { LocationPinIcon, SwapIcon } from "@/shared/ui/icons";

const WANTS_PILL_GAP = 8;
const WANT_PINS_MAX = 2;

type ExchangeChip = { full: string; label: string };

function buildExchangeChips({
  isFree,
  wants,
  wantCategories,
}: {
  isFree: boolean;
  wants: string[];
  wantCategories: ListingWantCategory[];
}): ExchangeChip[] {
  if (isFree) return [];

  const chips: ExchangeChip[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const full = raw.trim();
    if (!full) return;
    const key = full.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    chips.push({ full, label: full });
  };

  for (const tag of wants) push(tag);
  for (const item of wantCategories.filter((c) => c.parentId)) push(item.name);
  for (const item of wantCategories.filter((c) => !c.parentId)) push(item.name);

  if (chips.length === 0) {
    return [{ full: "Любые варианты", label: "Любые варианты" }];
  }

  return chips;
}

type HeroCompactRecommendationRowProps = {
  listingId: string;
  title: string;
  city: string;
  coverImageUrl?: string | null;
  wants?: string[];
  wantCategories?: ListingWantCategory[];
  isFree?: boolean;
  ownerId?: string | null;
};

export function HeroCompactRecommendationRow({
  listingId,
  title,
  city,
  coverImageUrl,
  wants = [],
  wantCategories = [],
  isFree = false,
  ownerId,
}: HeroCompactRecommendationRowProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { guardAuth } = useAuthGate();
  const wantsGroupRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);
  const listingHref = `/listings/${listingId}`;
  const isOwnListing = Boolean(user?.id && ownerId && user.id === ownerId);
  const showSwap = !isOwnListing;

  const allExchangeChips = useMemo(
    () => buildExchangeChips({ isFree, wants, wantCategories }),
    [isFree, wantCategories, wants],
  );

  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(WANT_PINS_MAX, allExchangeChips.length),
  );

  useLayoutEffect(() => {
    if (isFree || allExchangeChips.length === 0) {
      setVisibleCount(0);
      return;
    }

    const syncVisibleCount = () => {
      const groupEl = wantsGroupRef.current;
      const measureEl = measureRef.current;
      const moreMeasureEl = moreMeasureRef.current;
      if (!groupEl || !measureEl || !moreMeasureEl) return;

      const availableWidth = groupEl.clientWidth;
      if (availableWidth <= 0) return;

      const measurePills = Array.from(
        measureEl.querySelectorAll<HTMLElement>("[data-hero-want-measure-pill]"),
      );
      const maxCandidates = Math.min(WANT_PINS_MAX, measurePills.length);

      const measureMoreReserve = (hiddenCount: number) => {
        if (hiddenCount <= 0) return 0;
        moreMeasureEl.textContent = `+${hiddenCount}`;
        return moreMeasureEl.offsetWidth;
      };

      let nextCount = 0;
      let usedWidth = 0;

      for (let index = 0; index < maxCandidates; index += 1) {
        const pillWidth = measurePills[index]?.offsetWidth ?? 0;
        if (pillWidth <= 0) break;

        const nextWidth =
          index === 0 ? pillWidth : usedWidth + WANTS_PILL_GAP + pillWidth;
        const hiddenCount = allExchangeChips.length - (index + 1);
        const widthBudget = availableWidth - measureMoreReserve(hiddenCount);

        if (nextWidth > widthBudget) break;

        usedWidth = nextWidth;
        nextCount = index + 1;
      }

      setVisibleCount(nextCount);
    };

    syncVisibleCount();

    const groupEl = wantsGroupRef.current;
    if (!groupEl) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      syncVisibleCount();
    });
    resizeObserver.observe(groupEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [allExchangeChips, isFree]);

  const visibleExchangeChips = allExchangeChips.slice(0, visibleCount);
  const exchangeWantsMore = Math.max(0, allExchangeChips.length - visibleCount);

  const handleExchangeClick = () => {
    guardAuth("propose-exchange", () => {
      router.push(`${listingHref}/exchange`);
    });
  };

  return (
    <article className="home-hero-rec-row">
      <Link href={listingHref} className="home-hero-rec-row__media" aria-label={title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImageUrl || LISTING_PLACEHOLDER_IMAGE}
          alt=""
          className="home-hero-rec-row__image"
        />
      </Link>

      <div className="home-hero-rec-row__body">
        <Link href={listingHref} className="home-hero-rec-row__title">
          {title}
        </Link>

        <p className="home-hero-rec-row__city">
          <LocationPinIcon className="home-hero-rec-row__city-icon" />
          <span>{city}</span>
        </p>

        <div className="home-hero-rec-row__exchange">
          <span className="home-hero-rec-row__exchange-label">Обмен на:</span>
          {isFree ? (
            <span className="home-listing-card__free-pill">Отдается даром</span>
          ) : (
            <div ref={wantsGroupRef} className="home-hero-rec-row__wants-group">
              {visibleExchangeChips.length > 0 ? (
                <div className="home-listing-card__wants-pills home-hero-rec-row__wants-pills">
                  {visibleExchangeChips.map((chip) => (
                    <span key={chip.full} className="home-listing-card__want-pill">
                      <span className="home-listing-card__want-pill-text">{chip.label}</span>
                    </span>
                  ))}
                </div>
              ) : null}
              {exchangeWantsMore > 0 ? (
                <span className="home-listing-card__wants-more">+{exchangeWantsMore}</span>
              ) : null}
              <div
                ref={measureRef}
                className="home-hero-rec-row__wants-measure"
                aria-hidden="true"
              >
                {allExchangeChips.slice(0, WANT_PINS_MAX).map((chip) => (
                  <span
                    key={chip.full}
                    data-hero-want-measure-pill
                    className="home-listing-card__want-pill"
                  >
                    <span className="home-listing-card__want-pill-text">{chip.label}</span>
                  </span>
                ))}
                <span ref={moreMeasureRef} className="home-listing-card__wants-more" />
              </div>
            </div>
          )}
        </div>
      </div>

      {showSwap ? (
        <button
          type="button"
          className="home-hero-rec-row__swap"
          aria-label={isFree ? "Отдают даром" : "Быстрый обмен"}
          onClick={handleExchangeClick}
        >
          <SwapIcon className="home-hero-rec-row__swap-icon" />
        </button>
      ) : null}
    </article>
  );
}

export function HeroCompactRecommendationRowSkeleton() {
  return (
    <div className="home-hero-rec-row home-hero-rec-row--skeleton" aria-hidden="true">
      <div className="home-hero-rec-row__media home-hero-rec-row__media--skeleton" />
      <div className="home-hero-rec-row__body">
        <div className="home-hero-rec-row__title-skel" />
        <div className="home-hero-rec-row__title-skel home-hero-rec-row__title-skel--short" />
        <div className="home-hero-rec-row__title-skel home-hero-rec-row__title-skel--tiny" />
      </div>
      <div className="home-hero-rec-row__swap home-hero-rec-row__swap--skeleton" />
    </div>
  );
}
