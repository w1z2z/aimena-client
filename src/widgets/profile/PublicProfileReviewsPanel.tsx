"use client";

import { pluralRu } from "./constants";
import { ProfileReviewCard } from "./ProfileReviewCard";
import { MOCK_REVIEWS } from "./mocks";

export function PublicProfileReviewsPanel() {
  const total = MOCK_REVIEWS.length;
  const countLabel = `${total} ${pluralRu(total, "отзыв", "отзыва", "отзывов")}`;

  return (
    <section className="flex w-full flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="pr-14 text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Отзывы
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {MOCK_REVIEWS.map((review) => (
          <ProfileReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
