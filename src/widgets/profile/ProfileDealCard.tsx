/* eslint-disable @next/next/no-img-element */
"use client";

import { formatProfileNumber, PROFILE_ASSETS } from "./constants";
import type { MockDeal } from "./mocks";

const STATUS_BADGE: Record<
  MockDeal["status"],
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
  deal: MockDeal;
  /** Hide review CTA on public profiles. */
  showReviewAction?: boolean;
};

export function ProfileDealCard({ deal, showReviewAction = true }: ProfileDealCardProps) {
  const badge = STATUS_BADGE[deal.status];

  return (
    <article
      className={`relative flex w-full flex-col gap-6 rounded-[31px] bg-white p-6 ${
        deal.highlighted
          ? "border-2 border-solid border-[#8E8BED]"
          : "border-[0.5px] border-solid border-[#CACACA]"
      }`}
    >
      <p className="absolute right-6 top-6 text-[11px] font-semibold leading-4 tracking-[0.002em] text-[#626262]">
        {deal.date}
      </p>

      <div className="flex flex-wrap items-center gap-x-[24px] gap-y-4 pr-16 lg:gap-x-[132px]">
        <div className="flex items-start gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-[21px] bg-[#EBEBEB]">
            <img src={deal.given.imageUrl} alt="" className="size-full object-cover" />
          </div>
          <div className="flex h-20 w-[220px] flex-col justify-between sm:w-[262px]">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold leading-4 tracking-[0.002em] text-[#626262]">
                Отдал
              </p>
              <p className="truncate text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
                {deal.given.title}
              </p>
            </div>
            <img src={PROFILE_ASSETS.gallery} alt="" className="size-8" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div
            className={`flex size-[50px] shrink-0 items-center justify-center rounded-[17.857px] border-[0.641px] border-solid border-[#CACACA] ${badge.bg}`}
            title={badge.label}
            aria-label={badge.label}
          >
            <img src={badge.icon} alt="" className="h-[17px] w-[19px]" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-[21px] bg-[#EBEBEB]">
              <img src={deal.received.imageUrl} alt="" className="size-full object-cover" />
            </div>
            <div className="flex h-20 w-[220px] flex-col justify-between sm:w-[259px]">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold leading-4 tracking-[0.002em] text-[#626262]">
                  Получил
                </p>
                <p className="truncate text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
                  {deal.received.title}
                </p>
              </div>
              <img src={PROFILE_ASSETS.gallery} alt="" className="size-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-[9px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F2F4F7]">
            {deal.partner.avatarUrl ? (
              <img src={deal.partner.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-[16px] font-extrabold text-[#1A1A1A]">
                {deal.partner.avatarInitial}
              </div>
            )}
          </div>
          <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
            {deal.partner.name}
          </p>
          <span className="inline-flex items-center justify-center gap-0.5 rounded-[44px] bg-[#1A1A1A] px-3 py-2">
            <img src={PROFILE_ASSETS.pointsBolt} alt="" className="h-[6px] w-[4px]" />
            <span className="text-[11px] font-semibold leading-4 tracking-[0.002em] text-white">
              {formatProfileNumber(deal.partner.points)}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {showReviewAction && deal.canLeaveReview ? (
            <button
              type="button"
              className="rounded-[34px] border-[0.5px] border-solid border-[#CACACA] bg-[#C8FF00] px-3 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]"
            >
              Оставить отзыв
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-[34px] border-[0.5px] border-solid border-[#CACACA] bg-white px-3 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]"
          >
            Открыть чат
          </button>
        </div>
      </div>
    </article>
  );
}
