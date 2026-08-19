"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { getMyDealReviews } from "@/shared/api/deals";
import { ErrorBlock } from "@/shared/ui/ErrorBlock";

import { pluralRu } from "./constants";
import {
  getProfilePageCount,
  PROFILE_PAGE_SIZE,
  ProfilePagination,
} from "./ProfilePagination";
import { ProfileReviewCard } from "./ProfileReviewCard";

export function ProfileReviewsPanel() {
  const { user, accessToken } = useAuth();
  const [page, setPage] = useState(1);

  const reviewsQuery = useQuery({
    queryKey: ["profile-reviews-me", user?.id, page],
    queryFn: ({ signal }) =>
      getMyDealReviews({ page, pageSize: PROFILE_PAGE_SIZE }, signal),
    enabled: Boolean(user?.id && accessToken),
    placeholderData: (previous) => previous,
  });

  const reviews = reviewsQuery.data?.data ?? [];
  const total = reviewsQuery.data?.meta.total ?? 0;
  const pageCount = reviewsQuery.data?.meta.pageCount ?? getProfilePageCount(total);
  const countLabel = `${total} ${pluralRu(total, "отзыв", "отзыва", "отзывов")}`;

  let body: ReactNode;
  if (!user) {
    body = null;
  } else if (reviewsQuery.isLoading && reviews.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Загрузка отзывов…</p>;
  } else if (reviewsQuery.isError && reviews.length === 0) {
    body = (
      <ErrorBlock
        title="Не удалось загрузить отзывы"
        onRetry={() => void reviewsQuery.refetch()}
      />
    );
  } else if (reviews.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Пока нет отзывов.</p>;
  } else {
    body = (
      <>
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <ProfileReviewCard key={review.id} review={review} />
          ))}
        </div>
        <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
      </>
    );
  }

  return (
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Отзывы
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="mt-12 flex flex-col">{body}</div>
    </section>
  );
}
