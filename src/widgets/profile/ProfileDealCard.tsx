/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";

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
  variant?: "own" | "public";
  showReviewAction?: boolean;
  showChatAction?: boolean;
};

function ListingSide({
  label,
  side,
}: {
  label: string;
  side: DealHistoryListingSide;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listings = side.isFree ? [] : side.listings;
  const count = listings.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;
  const current = listings[safeIndex] ?? null;
  const displayTitle = side.isFree ? "Ничего" : (current?.title ?? side.title);

  const goNext = () => {
    if (count < 2) return;
    setActiveIndex((index) => (index + 1) % count);
  };

  return (
    <div className="profile-deal-side">
      <div className="profile-deal-thumb">
        <div
          className={`profile-deal-thumb__main${
            side.isFree ? " profile-deal-thumb__main--free" : ""
          }`}
        >
          {side.isFree ? (
            <span className="profile-deal-thumb__free-label">Даром</span>
          ) : current?.imageUrl ? (
            <img src={current.imageUrl} alt="" className="profile-deal-thumb__image" />
          ) : null}
          {count > 1 ? (
            <button
              type="button"
              className="profile-deal-thumb__pager"
              aria-label={`Следующее объявление, ${safeIndex + 1} из ${count}`}
              onClick={goNext}
            >
              <span>
                {safeIndex + 1}/{count}
              </span>
              <img src="/images/chat/offer-chevron.svg" alt="" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="profile-deal-side__meta">
        <p className="profile-deal-side__label">{label}</p>
        <p
          className={`profile-deal-side__title${
            side.isFree ? " profile-deal-side__title--empty" : ""
          }`}
          title={displayTitle}
        >
          {displayTitle}
        </p>
      </div>
    </div>
  );
}

function PersonRow({
  person,
  className = "",
}: {
  person: DealHistoryPerson;
  className?: string;
}) {
  const personHref = person.slug ? `/users/${person.slug}` : null;

  return (
    <div className={`profile-deal-card__person${className ? ` ${className}` : ""}`}>
      {personHref ? (
        <Link href={personHref} className="profile-deal-card__avatar">
          {person.avatarUrl ? (
            <img src={person.avatarUrl} alt="" />
          ) : (
            <span>{person.avatarInitial}</span>
          )}
        </Link>
      ) : (
        <div className="profile-deal-card__avatar">
          {person.avatarUrl ? (
            <img src={person.avatarUrl} alt="" />
          ) : (
            <span>{person.avatarInitial}</span>
          )}
        </div>
      )}
      {personHref ? (
        <Link href={personHref} className="profile-deal-card__person-name">
          {person.name}
        </Link>
      ) : (
        <p className="profile-deal-card__person-name">{person.name}</p>
      )}
      <span className="profile-deal-card__points">
        <RatingStarIcon />
        <span>{formatProfileNumber(person.points)}</span>
      </span>
    </div>
  );
}

export function ProfileDealCard({
  deal,
  variant = "own",
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
  const showReviewButton = showReviewAction && deal.canLeaveReview && reviewHref;
  const showChatButton = showChatAction && chatHref;

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

        {variant === "public" ? (
          <div className="profile-deal-card__owner">
            <PersonRow person={deal.owner} />
          </div>
        ) : null}
      </div>

      {variant === "own" ? (
        <div className="profile-deal-card__footer">
          <PersonRow person={deal.partner} />
          {showReviewButton || showChatButton ? (
            <div className="profile-deal-card__actions">
              {showReviewButton ? (
                <Link href={reviewHref} className="profile-deal-card__action is-primary">
                  Оставить отзыв
                </Link>
              ) : null}
              {showChatButton ? (
                <Link href={chatHref} className="profile-deal-card__action">
                  Открыть чат
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
