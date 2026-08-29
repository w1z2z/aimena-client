/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { AuthUser } from "@/features/auth";
import { RatingStarIcon } from "@/shared/ui/icons";

import {
  formatJoinedMonth,
  formatProfileNumber,
  formatRatingPoints,
  PROFILE_ASSETS,
  PROFILE_NAV,
  type ProfileSection,
} from "./constants";
import { saveProfileScrollPosition } from "@/shared/lib/profile-scroll-memory";
import { ProfileSidebarName } from "./ProfileSidebarName";

type ProfileSidebarProps = {
  user: AuthUser;
  active: ProfileSection;
};

export function ProfileSidebar({ user, active }: ProfileSidebarProps) {
  const joined = formatJoinedMonth(user.createdAt);
  const ratingDisplay = formatRatingPoints(user.ratingAvg);

  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar__card">
        <div className="profile-sidebar__head">
          <div className="profile-sidebar__identity">
            <div className="profile-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" />
              ) : (
                <div className="profile-avatar__fallback">{user.avatarInitial}</div>
              )}
            </div>

            <div className="profile-sidebar__meta">
              <div className="profile-sidebar__name-row">
                <ProfileSidebarName name={user.name} />
                {user.verified ? (
                  <img src={PROFILE_ASSETS.verified} alt="" className="profile-sidebar__verified" />
                ) : null}
              </div>

              <div className="profile-sidebar__location">
                <img src={PROFILE_ASSETS.pin} alt="" className="profile-sidebar__pin" />
                <span>{user.city ?? "Город не указан"}</span>
              </div>

              <p className="profile-sidebar__joined">
                {joined ? `На Aimena с ${joined}` : "На Aimena"}
              </p>
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
              <p className="profile-sidebar__stat-value">{formatProfileNumber(user.ratingCount)}</p>
            </div>

            <div className="profile-sidebar__stat">
              <p className="profile-sidebar__stat-label">Обменов</p>
              <p className="profile-sidebar__stat-value">{formatProfileNumber(user.swapsCount)}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="profile-sidebar__nav" aria-label="Разделы профиля">
        {PROFILE_NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              scroll={false}
              onClick={saveProfileScrollPosition}
              className={
                isActive
                  ? "profile-nav-item profile-nav-item--active"
                  : "profile-nav-item"
              }
            >
              <span className="profile-nav-item__icon">
                <img src={PROFILE_ASSETS[item.icon]} alt="" />
              </span>
              <span className="profile-nav-item__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
