/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type {
  DealHistoryItem,
  DealHistoryListingSide,
  DealHistoryPerson,
} from "@/shared/api/deals";

import { RatingStarIcon } from "@/shared/ui/icons";

import { formatProfileDate, formatProfileNumber, PROFILE_ASSETS } from "./constants";

const STATUS_BADGE: Record<
  DealHistoryItem["status"],
  { bg: string; icon: string; label: string }
> = {
  successful: {
    bg: "bg-[#c8ff02]",
    icon: PROFILE_ASSETS.swapAlt,
    label: "Успешный обмен",
  },
  cancelled: {
    bg: "bg-[#FF2056]",
    icon: PROFILE_ASSETS.swap,
    label: "Обмен не состоялся",
  },
};

const DEAL_SIDE_LABELS: Record<
  DealHistoryItem["status"],
  { given: string; received: string }
> = {
  successful: { given: "Отдал", received: "Получил" },
  cancelled: { given: "Предлагал", received: "Хотел получить" },
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

function PartnerRow({ partner }: { partner: DealHistoryPerson }) {
  const partnerHref = partner.slug ? `/users/${partner.slug}` : null;

  return (
    <div className="profile-deal-card__partner">
      {partnerHref ? (
        <Link href={partnerHref} className="profile-deal-card__avatar">
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt="" />
          ) : (
            <span>{partner.avatarInitial}</span>
          )}
        </Link>
      ) : (
        <div className="profile-deal-card__avatar">
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt="" />
          ) : (
            <span>{partner.avatarInitial}</span>
          )}
        </div>
      )}
      {partnerHref ? (
        <Link href={partnerHref} className="profile-deal-card__partner-name">
          {partner.name}
        </Link>
      ) : (
        <p className="profile-deal-card__partner-name">{partner.name}</p>
      )}
      <span className="profile-deal-card__points">
        <RatingStarIcon />
        <span>{formatProfileNumber(partner.points)}</span>
      </span>
    </div>
  );
}

export function ProfileDealCard({
  deal,
  showReviewAction = true,
  showChatAction = true,
}: ProfileDealCardProps) {
  const badge = STATUS_BADGE[deal.status];
  const sideLabels = DEAL_SIDE_LABELS[deal.status];
  const chatHref = deal.threadId
    ? `/chats?selected=${encodeURIComponent(deal.threadId)}`
    : null;
  const reviewHref = deal.threadId
    ? `/chats?selected=${encodeURIComponent(deal.threadId)}&dealModal=review`
    : null;
  const showActions =
    (showReviewAction && deal.canLeaveReview && reviewHref) ||
    (showChatAction && chatHref);

  return (
    <article
      className={`profile-deal-card${deal.highlighted ? " is-highlighted" : ""}`}
    >
      <p className="profile-deal-card__date">{formatProfileDate(deal.date)}</p>

      <div className="profile-deal-card__exchange">
        <div className="profile-deal-card__given">
          <ListingSide label={sideLabels.given} side={deal.given} />
        </div>

        <div
          className={`profile-deal-card__badge ${badge.bg}`}
          title={badge.label}
          aria-label={badge.label}
        >
          <img src={badge.icon} alt="" width={19} height={17} />
        </div>

        <div className="profile-deal-card__received">
          <ListingSide label={sideLabels.received} side={deal.received} />
        </div>

        <PartnerRow partner={deal.partner} />
      </div>

      {showActions ? (
        <div className="profile-deal-card__footer">
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
      ) : null}
    </article>
  );
}
