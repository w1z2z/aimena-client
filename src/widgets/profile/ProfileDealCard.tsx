/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { DealHistoryItem, DealHistoryListingSide } from "@/shared/api/deals";

import { RatingStarIcon } from "@/shared/ui/icons";

import { formatProfileDate, formatProfileNumber, PROFILE_ASSETS } from "./constants";

const STATUS_BADGE: Record<
  DealHistoryItem["status"],
  { bg: string; icon: string; label: string }
> = {
  successful: {
    bg: "bg-[#C8FF00]",
    icon: PROFILE_ASSETS.swapAlt,
    label: "Успешный обмен",
  },
  in_progress: {
    bg: "bg-[#8E8BED]",
    icon: PROFILE_ASSETS.swap,
    label: "Обмен в процессе",
  },
  cancelled: {
    bg: "bg-[#FF2056]",
    icon: PROFILE_ASSETS.swap,
    label: "Обмен отменён",
  },
};

type ProfileDealCardProps = {
  deal: DealHistoryItem;
  /** Hide review CTA on public profiles. */
  showReviewAction?: boolean;
  showChatAction?: boolean;
};

function ListingThumb({ side }: { side: DealHistoryListingSide }) {
  const hiddenCount = Math.max((side.listingsCount ?? 1) - 2, 0);
  const showStack = Boolean(side.secondaryImageUrl) || hiddenCount > 0;

  return (
    <div className={`profile-deal-thumb${showStack ? " has-stack" : ""}`}>
      <div className="profile-deal-thumb__main">
        {side.imageUrl ? (
          <img src={side.imageUrl} alt="" className="profile-deal-thumb__image" />
        ) : null}
      </div>
      {showStack ? (
        <span className="profile-deal-thumb__stack">
          {side.secondaryImageUrl ? (
            <img
              src={side.secondaryImageUrl}
              alt=""
              className="profile-deal-thumb__stack-image"
            />
          ) : null}
          {hiddenCount > 0 ? (
            <span className="profile-deal-thumb__stack-count">+{hiddenCount}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

function ListingSide({
  label,
  side,
}: {
  label: string;
  side: DealHistoryListingSide;
}) {
  return (
    <div className="profile-deal-side">
      <ListingThumb side={side} />
      <div className="profile-deal-side__meta">
        <p className="profile-deal-side__label">{label}</p>
        <p className="profile-deal-side__title" title={side.title}>
          {side.title}
        </p>
      </div>
    </div>
  );
}

export function ProfileDealCard({
  deal,
  showReviewAction = true,
  showChatAction = true,
}: ProfileDealCardProps) {
  const badge = STATUS_BADGE[deal.status];
  const chatHref = deal.threadId
    ? `/chats?selected=${encodeURIComponent(deal.threadId)}`
    : null;
  const reviewHref = deal.threadId
    ? `/chats?selected=${encodeURIComponent(deal.threadId)}&dealModal=review`
    : null;
  const partnerHref = deal.partner.slug ? `/users/${deal.partner.slug}` : null;

  return (
    <article
      className={`profile-deal-card${deal.highlighted ? " is-highlighted" : ""}`}
    >
      <p className="profile-deal-card__date">{formatProfileDate(deal.date)}</p>

      <div className="profile-deal-card__exchange">
        <ListingSide label="Отдал" side={deal.given} />

        <div
          className={`profile-deal-card__badge ${badge.bg}`}
          title={badge.label}
          aria-label={badge.label}
        >
          <img src={badge.icon} alt="" width={19} height={17} />
        </div>

        <ListingSide label="Получил" side={deal.received} />
      </div>

      <div className="profile-deal-card__footer">
        <div className="profile-deal-card__partner">
          {partnerHref ? (
            <Link href={partnerHref} className="profile-deal-card__avatar">
              {deal.partner.avatarUrl ? (
                <img src={deal.partner.avatarUrl} alt="" />
              ) : (
                <span>{deal.partner.avatarInitial}</span>
              )}
            </Link>
          ) : (
            <div className="profile-deal-card__avatar">
              {deal.partner.avatarUrl ? (
                <img src={deal.partner.avatarUrl} alt="" />
              ) : (
                <span>{deal.partner.avatarInitial}</span>
              )}
            </div>
          )}
          {partnerHref ? (
            <Link href={partnerHref} className="profile-deal-card__partner-name">
              {deal.partner.name}
            </Link>
          ) : (
            <p className="profile-deal-card__partner-name">{deal.partner.name}</p>
          )}
          <span className="profile-deal-card__points">
            <RatingStarIcon />
            <span>{formatProfileNumber(deal.partner.points)}</span>
          </span>
        </div>

        <div className="profile-deal-card__actions">
          {showReviewAction && deal.canLeaveReview && reviewHref ? (
            <Link href={reviewHref} className="profile-deal-card__action is-primary">
              Оставить отзыв
            </Link>
          ) : null}
          {showChatAction && chatHref ? (
            <Link href={chatHref} className="profile-deal-card__action">
              Открыть чат
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
