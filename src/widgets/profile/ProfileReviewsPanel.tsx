/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

import { pluralRu } from "./constants";
import { ProfileSortControl } from "./ProfileSortControl";

type ReviewStub = {
  id: string;
  author: string;
  points: string;
  date: string;
  text: string;
};

const REVIEW_TEXT =
  "Мощь, титан и наконец-то нормальный зум, но цена кусается — ждать полноценного ИИ на русском ещё полгодМощь, титан и наконец-то нормальный зум, но цена кусается — ждать полноценного ИИ на русском ещё полгодМощь, титан и наконец-то нормальный зум, но цена кусается — ждать полноценного ИИ на русском ещё полгодМощь, титан и наконец-то нормальный зум, но цена кусается — ждать полноценного ИИ на русском ещё полгод";

const REVIEW_STUBS: ReviewStub[] = [
  {
    id: "1",
    author: "Иван Перов",
    points: "27 777",
    date: "21.06.2026",
    text: REVIEW_TEXT,
  },
  {
    id: "2",
    author: "Иван Перов",
    points: "27 777",
    date: "21.06.2026",
    text: REVIEW_TEXT,
  },
  {
    id: "3",
    author: "Иван Перов",
    points: "27 777",
    date: "21.06.2026",
    text: REVIEW_TEXT,
  },
];

export function ProfileReviewsPanel() {
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const total = REVIEW_STUBS.length;

  return (
    // Figma: контент профиля 1074px — как у «Ваши объявления»
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Отзывы
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
          {total} {pluralRu(total, "отзыв", "отзыва", "отзывов")}
        </p>
      </div>

      <div className="relative mt-12 w-full">
        <div className="absolute bottom-full right-0 mb-2">
          <ProfileSortControl value={sort} onChange={setSort} />
        </div>

        <div className="flex flex-col gap-6">
          {REVIEW_STUBS.map((review) => (
            <article
              key={review.id}
              className="box-border flex flex-col items-start rounded-[10px] border-[0.5px] border-solid border-[#CACACA] bg-white p-6"
            >
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-[9px] border-[0.5px] border-solid border-[#8E8BED] bg-[#D9D9D9]">
                      <div className="flex size-full items-center justify-center text-[16px] font-extrabold text-[#1A1A1A]">
                        {review.author.charAt(0)}
                      </div>
                    </div>
                    <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                      {review.author}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 rounded-[44px] bg-[#1A1A1A] px-3 py-2">
                      <img
                        src="/profile/icon-points-bolt.svg"
                        alt=""
                        className="h-[6px] w-[3.5px]"
                      />
                      <span className="text-[11px] font-semibold leading-4 tracking-[0.02em] text-white">
                        {review.points}
                      </span>
                    </div>
                  </div>
                  <p className="w-[60px] text-right text-[11px] font-semibold leading-4 tracking-[0.02em] text-[#636363]">
                    {review.date}
                  </p>
                </div>
                <p className="w-full text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
                  {review.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
