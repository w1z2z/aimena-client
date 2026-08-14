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
      className={`flex w-full flex-col gap-3 border-[0.5px] border-solid border-[#CACACA] bg-white ${
        compact ? "rounded-[21px] p-4" : "rounded-[31px] p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {authorHref ? (
            <Link
              href={authorHref}
              className="relative size-11 shrink-0 overflow-hidden rounded-[9px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F2F4F7]"
            >
              {review.author.avatarUrl ? (
                <img src={review.author.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-[16px] font-extrabold text-[#1A1A1A]">
                  {review.author.avatarInitial}
                </div>
              )}
            </Link>
          ) : (
            <div className="relative size-11 shrink-0 overflow-hidden rounded-[9px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F2F4F7]">
              {review.author.avatarUrl ? (
                <img src={review.author.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-[16px] font-extrabold text-[#1A1A1A]">
                  {review.author.avatarInitial}
                </div>
              )}
            </div>
          )}
          <div className={`min-w-0 ${compact ? "flex flex-col gap-1" : "flex items-center gap-3"}`}>
            {authorHref ? (
              <Link
                href={authorHref}
                className="truncate text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A] hover:text-[#8E8BED]"
              >
                {review.author.name}
              </Link>
            ) : (
              <p className="truncate text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
                {review.author.name}
              </p>
            )}
            <span className="inline-flex w-fit items-center justify-center gap-1 rounded-[44px] bg-[#1A1A1A] px-3 py-2">
              <RatingStarIcon className="size-[13px]" />
              <span className="text-[11px] font-semibold leading-4 tracking-[0.002em] text-white">
                {formatProfileNumber(review.author.points)}
              </span>
            </span>
          </div>
        </div>
        {!compact ? (
          <p className="shrink-0 text-[11px] font-semibold leading-4 tracking-[0.002em] text-[#636363]">
            {formatProfileDate(review.date)}
          </p>
        ) : null}
      </div>

      <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">{review.text}</p>
    </article>
  );
}
