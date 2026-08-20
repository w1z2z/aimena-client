/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { BackendPublicProfile } from "@/shared/api/auth";
import { RatingStarIcon } from "@/shared/ui/icons";
import { getUserDealReviews } from "@/shared/api/deals";
import { useQuery } from "@tanstack/react-query";

import {
  formatJoinedMonth,
  formatProfileNumber,
  formatRatingPoints,
  getPublicProfileNav,
  PROFILE_ASSETS,
  type PublicProfileSection,
} from "./constants";
import { ProfileReviewCard } from "./ProfileReviewCard";
import { PublicProfileActionsMenu } from "./PublicProfileActionsMenu";

type PublicProfileSidebarProps = {
  profile: BackendPublicProfile;
  active: PublicProfileSection;
};

export function PublicProfileSidebar({ profile, active }: PublicProfileSidebarProps) {
  const joined = formatJoinedMonth(profile.joinedAt);
  const avatarInitial = profile.displayName.trim().charAt(0).toUpperCase() || "U";
  const ratingDisplay = formatRatingPoints(profile.ratingAvg);
  const nav = getPublicProfileNav(profile.slug);
  const reviewsCount = profile.ratingCount;
  const showReviewsBlock = active !== "reviews";
  const reviewsPreviewQuery = useQuery({
    queryKey: ["public-profile-reviews-preview", profile.slug],
    queryFn: ({ signal }) =>
      getUserDealReviews(profile.slug, { page: 1, pageSize: 3 }, signal),
    enabled: showReviewsBlock,
  });
  const sidebarReviews = reviewsPreviewQuery.data?.data ?? [];

  return (
    <aside className="flex w-full max-w-[342px] shrink-0 flex-col items-stretch gap-6">
      <div className="relative flex flex-col items-center gap-9 overflow-visible rounded-[31px] bg-white p-6">
        <PublicProfileActionsMenu userId={profile.id} />

        <div className="relative size-[158px] shrink-0 overflow-hidden rounded-[49px] border-[0.5px] border-solid border-[#8E8BED]">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#cacaca] text-[48px] font-extrabold text-[#1A1A1A]">
              {avatarInitial}
            </div>
          )}
        </div>

        <div className="relative z-[1] flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-1">
            <p className="max-w-[171px] text-center text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#1A1A1A]">
              {profile.displayName}
            </p>
            {profile.verified ? (
              <img src={PROFILE_ASSETS.verified} alt="" className="size-[17px] shrink-0" />
            ) : null}
          </div>

          {profile.city ? (
            <div className="flex items-center justify-center gap-2 rounded-[18px] border-[0.5px] border-solid border-[#CACACA] bg-white px-5 py-2">
              <img src={PROFILE_ASSETS.pin} alt="" className="h-[12px] w-[9px]" />
              <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                {profile.city.name}
              </span>
            </div>
          ) : null}

          {profile.bio ? (
            <p className="max-w-[270px] text-center text-[14px] font-normal leading-[1.7] text-[#626262]">
              {profile.bio}
            </p>
          ) : null}
        </div>

        <div className="relative z-[1] flex w-full flex-col gap-3">
          <div className="flex h-[95px] w-full flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-6">
            <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              Рейтинг профиля
            </p>
            <div className="flex items-center gap-1">
              <RatingStarIcon className="size-[17px]" />
              <p className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#8E8BED]">
                {ratingDisplay}
              </p>
            </div>
          </div>

          <div className="flex h-[95px] w-full flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-6">
            <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              Отзывов
            </p>
            <p className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#8E8BED]">
              {formatProfileNumber(reviewsCount)}
            </p>
          </div>

          <div className="flex h-[95px] w-full flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-6">
            <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              Обменов
            </p>
            <p className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#8E8BED]">
              {formatProfileNumber(profile.swapsCount)}
            </p>
          </div>
        </div>

        <p className="relative z-[1] text-center text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
          {joined ? `На Aimena с ${joined}` : "На Aimena"}
        </p>
      </div>

      <nav className="flex w-full flex-col gap-3">
        {nav.map((item) => {
          const isActive = item.id === active;
          const dealsHidden =
            item.id === "deals" && !profile.showCompletedListings;
          const activeClass =
            "relative flex h-[67px] w-full items-center gap-3 rounded-[21px] border-2 border-solid border-transparent bg-white px-6 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#8E8BED_0%,#c8ff02_100%)_border-box]";
          const idleClass =
            "relative flex h-[67px] w-full items-center gap-3 rounded-[21px] bg-white px-6 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] transition hover:bg-[#f8f8f5]";
          const disabledClass =
            "relative flex h-[67px] w-full cursor-not-allowed items-center gap-3 rounded-[21px] bg-white px-6 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#626262] opacity-60";

          if (dealsHidden) {
            return (
              <div key={item.id} className="group relative w-full">
                <span
                  role="link"
                  aria-disabled="true"
                  aria-describedby="deals-history-hidden-hint"
                  className={disabledClass}
                >
                  <span className="relative size-6 shrink-0 overflow-hidden opacity-60">
                    <img
                      src={PROFILE_ASSETS[item.icon]}
                      alt=""
                      className="absolute inset-0 size-full object-contain"
                    />
                  </span>
                  {item.label}
                </span>
                <span
                  id="deals-history-hidden-hint"
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 w-[min(100%,280px)] -translate-x-1/2 rounded-[18px] bg-[#1A1A1A] px-3 py-2 text-center text-[12px] font-semibold leading-[1.35] text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-opacity duration-150 group-hover:opacity-100"
                >
                  Пользователь скрыл историю обменов в настройках приватности.
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              scroll={false}
              className={isActive ? activeClass : idleClass}
            >
              <span className="relative size-6 shrink-0 overflow-hidden">
                <img
                  src={PROFILE_ASSETS[item.icon]}
                  alt=""
                  className="absolute inset-0 size-full object-contain"
                />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {showReviewsBlock ? (
        <section className="flex w-full flex-col overflow-hidden rounded-[31px] bg-[#F8F8F5] px-[14px] py-[15px]">
          <h2 className="w-full shrink-0 pb-3 text-center text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#1A1A1A]">
            Отзывы ({formatProfileNumber(reviewsCount)})
          </h2>

          {reviewsPreviewQuery.isLoading ? (
            <p className="w-full py-6 text-center text-[14px] font-semibold leading-[1.4] text-[#626262]">
              Загрузка отзывов…
            </p>
          ) : sidebarReviews.length === 0 ? (
            <p className="w-full py-6 text-center text-[14px] font-semibold leading-[1.4] text-[#626262]">
              Пока нет отзывов.
            </p>
          ) : (
            <div className="flex w-full flex-col gap-3">
              {sidebarReviews.map((review) => (
                <ProfileReviewCard key={review.id} review={review} compact />
              ))}
              <Link
                href={`/users/${profile.slug}/reviews`}
                scroll={false}
                className="flex h-3 w-full shrink-0 items-center justify-center self-stretch text-center text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A] hover:text-[#8E8BED]"
              >
                показать все отзывы
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </aside>
  );
}
