/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { DealReviewItem } from "@/shared/api/deals";

import { RatingStarIcon } from "@/shared/ui/icons";

import { formatProfileDate, formatProfileNumber } from "./constants";

type ProfileReviewCardProps = {
  review: DealReviewItem;
  compact?: boolean;
};

export function ProfileReviewCard({ review, compact = false }: ProfileReviewCardProps) {
  const authorHref = review.author.slug ? `/users/${review.author.slug}` : null;

  return (
    <article
      className={`profile-review-card${compact ? " profile-review-card--compact" : ""}`}
    >
      <p className="profile-review-card__date">{formatProfileDate(review.date)}</p>

      <div className="profile-review-card__header">
        <div className="profile-review-card__author">
          {authorHref ? (
            <Link href={authorHref} className="profile-review-card__avatar">
              {review.author.avatarUrl ? (
                <img src={review.author.avatarUrl} alt="" />
              ) : (
                <span>{review.author.avatarInitial}</span>
              )}
            </Link>
          ) : (
            <div className="profile-review-card__avatar">
              {review.author.avatarUrl ? (
                <img src={review.author.avatarUrl} alt="" />
              ) : (
                <span>{review.author.avatarInitial}</span>
              )}
            </div>
          )}
          <div className="profile-review-card__author-meta">
            {authorHref ? (
              <Link href={authorHref} className="profile-review-card__author-name">
                {review.author.name}
              </Link>
            ) : (
              <p className="profile-review-card__author-name">{review.author.name}</p>
            )}
            <span className="profile-review-card__points">
              <RatingStarIcon />
              <span>{formatProfileNumber(review.author.points)}</span>
            </span>
          </div>
        </div>
      </div>

      <p className="profile-review-card__text">{review.text}</p>

      {review.swap?.receivedTitle ? (
        <p className="profile-review-card__received">{review.swap.receivedTitle}</p>
      ) : null}
    </article>
  );
}
