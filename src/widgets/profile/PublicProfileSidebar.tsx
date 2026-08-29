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
import { ProfileSidebarName } from "./ProfileSidebarName";
import { saveProfileScrollPosition } from "@/shared/lib/profile-scroll-memory";

type PublicProfileSidebarProps = {
  profile: BackendPublicProfile;
  active: PublicProfileSection;
};

export function PublicProfileSidebar({ profile, active }: PublicProfileSidebarProps) {
  const joined = formatJoinedMonth(profile.joinedAt);
  const avatarInitial = profile.displayName.trim().charAt(0).toUpperCase() || "U";
  const ratingDisplay = formatRatingPoints(profile.ratingAvg);
  const nav = getPublicProfileNav(profile.slug);
  const showReviewsBlock = active !== "reviews";
  const reviewsPreviewQuery = useQuery({
    queryKey: ["public-profile-reviews-preview", profile.slug],
    queryFn: ({ signal }) =>
      getUserDealReviews(profile.slug, { page: 1, pageSize: 3 }, signal),
    enabled: showReviewsBlock,
  });
  const sidebarReviews = reviewsPreviewQuery.data?.data ?? [];
  const reviewsCount =
    reviewsPreviewQuery.data?.meta.total ??
    (reviewsPreviewQuery.isSuccess ? 0 : profile.ratingCount);

  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar__card profile-sidebar__card--public">
        <PublicProfileActionsMenu userId={profile.id} placement="card" />

        <div className="profile-sidebar__head">
          <div className="profile-sidebar__identity">
            <div className="profile-avatar-wrap">
              <PublicProfileActionsMenu userId={profile.id} placement="avatar" />
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" />
                ) : (
                  <div className="profile-avatar__fallback">{avatarInitial}</div>
                )}
              </div>
            </div>

            <div className="profile-sidebar__meta">
              <div className="profile-sidebar__name-row">
                <ProfileSidebarName name={profile.displayName} />
                {profile.verified ? (
                  <img src={PROFILE_ASSETS.verified} alt="" className="profile-sidebar__verified" />
                ) : null}
              </div>

              {profile.city ? (
                <div className="profile-sidebar__location">
                  <img src={PROFILE_ASSETS.pin} alt="" className="profile-sidebar__pin" />
                  <span>{profile.city.name}</span>
                </div>
              ) : null}

              <p className="profile-sidebar__joined">
                {joined ? `На Aimena с ${joined}` : "На Aimena"}
              </p>

              {profile.bio ? <p className="profile-sidebar__bio">{profile.bio}</p> : null}
            </div>
          </div>

          <div className="profile-sidebar__stats">
            <div className="profile-sidebar__stat">
              <p className="profile-sidebar__stat-label">Рейтинг профиля</p>
              <div className="profile-sidebar__stat-value profile-sidebar__stat-value--rating">
                <RatingStarIcon className="profile-sidebar__stat-star" />
                <span>{ratingDisplay}</span>
              </div>
            </div>

            <div className="profile-sidebar__stat">
              <p className="profile-sidebar__stat-label">Отзывов</p>
              <p className="profile-sidebar__stat-value">{formatProfileNumber(reviewsCount)}</p>
            </div>

            <div className="profile-sidebar__stat">
              <p className="profile-sidebar__stat-label">Обменов</p>
              <p className="profile-sidebar__stat-value">
                {formatProfileNumber(profile.swapsCount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="profile-sidebar__nav" aria-label="Разделы профиля">
        {nav.map((item) => {
          const isActive = item.id === active;
          const dealsHidden = item.id === "deals" && !profile.showCompletedListings;
          const activeClass = "profile-nav-item profile-nav-item--active";
          const idleClass = "profile-nav-item";
          const disabledClass = "profile-nav-item profile-nav-item--disabled";

          if (dealsHidden) {
            return (
              <div key={item.id} className="profile-sidebar__nav-item-wrap group relative">
                <span
                  role="link"
                  aria-disabled="true"
                  aria-describedby="deals-history-hidden-hint"
                  className={disabledClass}
                >
                  <span className="profile-nav-item__icon profile-nav-item__icon--muted">
                    <img src={PROFILE_ASSETS[item.icon]} alt="" />
                  </span>
                  <span className="profile-nav-item__label">{item.label}</span>
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
              onClick={saveProfileScrollPosition}
              className={`${isActive ? activeClass : idleClass}${
                item.compactOnly ? " profile-nav-item--compact-only" : ""
              }`}
            >
              <span className="profile-nav-item__icon">
                <img src={PROFILE_ASSETS[item.icon]} alt="" />
              </span>
              <span className="profile-nav-item__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {showReviewsBlock ? (
        <section className="profile-sidebar__reviews profile-sidebar__reviews--desktop-only">
          <h2 className="profile-sidebar__reviews-title">
            Отзывы ({formatProfileNumber(reviewsCount)})
          </h2>

          {reviewsPreviewQuery.isLoading ? (
            <p className="profile-sidebar__reviews-empty">Загрузка отзывов…</p>
          ) : sidebarReviews.length === 0 ? (
            <p className="profile-sidebar__reviews-empty">Пока нет отзывов.</p>
          ) : (
            <div className="flex w-full flex-col gap-3">
              {sidebarReviews.map((review) => (
                <ProfileReviewCard key={review.id} review={review} compact />
              ))}
              <Link
                href={`/users/${profile.slug}/reviews`}
                scroll={false}
                onClick={saveProfileScrollPosition}
                className="profile-sidebar__reviews-more"
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
