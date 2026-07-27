/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

import { pluralRu } from "./constants";
import { ProfileSortControl } from "./ProfileSortControl";

type DealStub = {
  id: string;
  date: string;
  gaveTitle: string;
  gotTitle: string;
  partnerName: string;
  points: string;
  statusColor: string;
  canReview: boolean;
};

const DEAL_STUBS: DealStub[] = [
  {
    id: "1",
    date: "21.06.2026",
    gaveTitle: 'MacBook 14"',
    gotTitle: "iPhone 17 Pro, Apple watch",
    partnerName: "Иван Перов",
    points: "27 777",
    statusColor: "#C8FF00",
    canReview: true,
  },
  {
    id: "2",
    date: "18.06.2026",
    gaveTitle: 'MacBook 14"',
    gotTitle: "iPhone 17 Pro, Apple watch",
    partnerName: "Иван Перов",
    points: "27 777",
    statusColor: "#8E8BED",
    canReview: false,
  },
  {
    id: "3",
    date: "12.06.2026",
    gaveTitle: 'MacBook 14"',
    gotTitle: "iPhone 17 Pro, Apple watch",
    partnerName: "Иван Перов",
    points: "27 777",
    statusColor: "#FF2056",
    canReview: false,
  },
];

export function ProfileDealsPanel() {
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const total = DEAL_STUBS.length;

  return (
    // Figma: контент профиля 1074px — как у «Ваши объявления»
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          История обменов
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
          {total} {pluralRu(total, "обмен", "обмена", "обменов")}
        </p>
      </div>

      <div className="relative mt-12 w-full">
        <div className="absolute bottom-full left-0 right-0 mb-2 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border-[0.5px] border-solid border-[#CACACA] bg-[#C8FF00]"
                aria-hidden
              />
              <span className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
                Успешно
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border-[0.5px] border-solid border-[#CACACA] bg-[#8E8BED]"
                aria-hidden
              />
              <span className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
                В процессе
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border-[0.5px] border-solid border-[#CACACA] bg-[#FF2056]"
                aria-hidden
              />
              <span className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
                Не состоялся
              </span>
            </div>
          </div>
          <ProfileSortControl value={sort} onChange={setSort} />
        </div>

        <div className="flex flex-col gap-6">
          {DEAL_STUBS.map((deal) => (
            <article
              key={deal.id}
              className="relative box-border flex min-h-[173px] flex-col justify-between gap-5 rounded-[10px] border-[0.5px] border-solid border-[#CACACA] bg-white p-6"
            >
              <p className="absolute right-6 top-6 text-[11px] font-semibold leading-4 tracking-[0.02em] text-[#636363]">
                {deal.date}
              </p>

              <div className="flex flex-wrap items-start gap-4 pr-16 lg:gap-6">
                {/* Отдал */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="relative size-[80px] shrink-0 overflow-hidden rounded-[21px] bg-[#EBEBEB]">
                    <img
                      src="/profile/deal-gave.png"
                      alt=""
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 pt-0.5">
                    <p className="text-[11px] font-semibold leading-4 tracking-[0.02em] text-[#636363]">
                      Отдал
                    </p>
                    <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                      {deal.gaveTitle}
                    </p>
                    <div className="flex h-6 w-8 items-center justify-center rounded-[10px] bg-[#EBEBEB]">
                      <img src="/profile/icon-gallery.svg" alt="" className="h-[6px] w-2" />
                    </div>
                  </div>
                </div>

                {/* Swap status */}
                <div
                  className="mt-3 flex size-[50px] shrink-0 items-center justify-center rounded-[18px] border-[0.64px] border-solid border-[#CACACA]"
                  style={{ backgroundColor: deal.statusColor }}
                  aria-hidden
                >
                  <img src="/profile/icon-swap.svg" alt="" className="h-[17px] w-[19px]" />
                </div>

                {/* Получил */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="relative size-[80px] shrink-0 overflow-hidden rounded-[21px] bg-[#EBEBEB]">
                    <img
                      src="/profile/deal-got.png"
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
                    <p className="text-[11px] font-semibold leading-4 tracking-[0.02em] text-[#636363]">
                      Получил
                    </p>
                    <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                      {deal.gotTitle}
                    </p>
                    <div className="flex h-6 w-8 items-center justify-center rounded-[10px] bg-[#EBEBEB]">
                      <img src="/profile/icon-gallery.svg" alt="" className="h-[6px] w-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-[38px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                    <div className="flex size-full items-center justify-center text-[14px] font-extrabold text-[#1A1A1A]">
                      {deal.partnerName.charAt(0)}
                    </div>
                  </div>
                  <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                    {deal.partnerName}
                  </p>
                  <div className="box-border flex h-6 w-auto min-w-[72px] shrink-0 items-center justify-center gap-0.5 rounded-[44px] bg-[#1A1A1A] px-3 py-2">
                    <img src="/profile/icon-points-bolt.svg" alt="" className="h-[11px] w-auto" />
                    <span className="text-[11px] font-semibold leading-4 tracking-[0.02em] text-white">
                      {deal.points}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {deal.canReview ? (
                    <button
                      type="button"
                      className="box-border flex h-[34px] w-[133px] shrink-0 items-center justify-center rounded-[34px] border-[0.5px] border-solid border-[#CACACA] bg-[#C8FF00] text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]"
                    >
                      Оставить отзыв
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="box-border flex h-[34px] w-[133px] shrink-0 items-center justify-center rounded-[34px] border-[0.5px] border-solid border-[#CACACA] bg-white text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]"
                  >
                    Открыть чат
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
