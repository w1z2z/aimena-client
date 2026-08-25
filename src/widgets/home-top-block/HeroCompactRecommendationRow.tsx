"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ListingWantCategory } from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { LocationPinIcon, SwapIcon } from "@/shared/ui/icons";

const WANT_MAX_CHARS = 18;
const WANT_PINS_MAX = 2;

function truncateWantLabel(label: string) {
  const normalized = label.trim();
  if (normalized.length <= WANT_MAX_CHARS) return normalized;
  return `${normalized.slice(0, WANT_MAX_CHARS).trimEnd()}...`;
}

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
    chips.push({
      full,
      label: truncateWantLabel(full),
    });
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
  const listingHref = `/listings/${listingId}`;
  const isOwnListing = Boolean(user?.id && ownerId && user.id === ownerId);
  const showSwap = !isOwnListing;
  const allExchangeChips = buildExchangeChips({ isFree, wants, wantCategories });
  const visibleExchangeChips = allExchangeChips.slice(0, WANT_PINS_MAX);
  const exchangeWantsMore = Math.max(0, allExchangeChips.length - WANT_PINS_MAX);

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
            <div className="home-hero-rec-row__wants-group">
              <div className="home-listing-card__wants-pills home-hero-rec-row__wants-pills">
                {visibleExchangeChips.map((chip) => (
                  <span
                    key={chip.full}
                    className="home-listing-card__want-pill"
                    title={chip.full !== chip.label ? chip.full : undefined}
                  >
                    <span className="home-listing-card__want-pill-text">{chip.label}</span>
                  </span>
                ))}
              </div>
              {exchangeWantsMore > 0 ? (
                <span className="home-listing-card__wants-more">+{exchangeWantsMore}</span>
              ) : null}
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
