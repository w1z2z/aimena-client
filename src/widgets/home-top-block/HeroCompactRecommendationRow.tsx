"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ListingWantCategory } from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import { LISTING_PLACEHOLDER_IMAGE } from "@/shared/lib/home-image-placeholders";
import { LocationPinIcon, SwapIcon } from "@/shared/ui/icons";

const WANT_MAX_CHARS = 22;

function truncateWantLabel(label: string) {
  const normalized = label.trim();
  if (normalized.length <= WANT_MAX_CHARS) return normalized;
  return `${normalized.slice(0, WANT_MAX_CHARS).trimEnd()}…`;
}

/** One chip: tag → subcategory → category. */
function resolveExchangeChip({
  isFree,
  wants,
  wantCategories,
}: {
  isFree: boolean;
  wants: string[];
  wantCategories: ListingWantCategory[];
}): { label: string; title?: string } {
  if (isFree) return { label: "Даром" };

  const tag = wants.find((item) => item.trim())?.trim();
  if (tag) {
    return { label: truncateWantLabel(tag), title: tag.length > WANT_MAX_CHARS ? tag : undefined };
  }

  const subcategory = wantCategories.find((item) => item.parentId);
  if (subcategory) {
    return {
      label: truncateWantLabel(subcategory.name),
      title: subcategory.name.length > WANT_MAX_CHARS ? subcategory.name : undefined,
    };
  }

  const category = wantCategories.find((item) => !item.parentId) ?? wantCategories[0];
  if (category) {
    return {
      label: truncateWantLabel(category.name),
      title: category.name.length > WANT_MAX_CHARS ? category.name : undefined,
    };
  }

  return { label: "Любые варианты" };
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
  const exchangeChip = resolveExchangeChip({ isFree, wants, wantCategories });

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
          <span className="home-hero-rec-row__pill" title={exchangeChip.title}>
            {exchangeChip.label}
          </span>
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
