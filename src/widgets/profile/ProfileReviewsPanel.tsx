"use client";

import { useMemo, useState } from "react";

import { pluralRu } from "./constants";
import {
  getProfilePageCount,
  PROFILE_PAGE_SIZE,
  ProfilePagination,
} from "./ProfilePagination";
import { ProfileReviewCard } from "./ProfileReviewCard";
import { MOCK_REVIEWS, paginateItems } from "./mocks";

export function ProfileReviewsPanel() {
  const [page, setPage] = useState(1);
  const total = MOCK_REVIEWS.length;
  const pageCount = getProfilePageCount(total);
  const reviews = useMemo(
    () => paginateItems(MOCK_REVIEWS, page, PROFILE_PAGE_SIZE),
    [page],
  );
  const countLabel = `${total} ${pluralRu(total, "отзыв", "отзыва", "отзывов")}`;

  return (
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Отзывы
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {reviews.map((review) => (
          <ProfileReviewCard key={review.id} review={review} />
        ))}
      </div>
      <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  );
}
