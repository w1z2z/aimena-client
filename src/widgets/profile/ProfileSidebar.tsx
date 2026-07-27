/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { AuthUser } from "@/features/auth";

import {
  formatJoinedMonth,
  formatProfileNumber,
  PROFILE_ASSETS,
  PROFILE_NAV,
  type ProfileSection,
} from "./constants";

type ProfileSidebarProps = {
  user: AuthUser;
  active: ProfileSection;
};

export function ProfileSidebar({ user, active }: ProfileSidebarProps) {
  const joined = formatJoinedMonth(user.createdAt);
  const ratingDisplay =
    user.ratingAvg >= 100
      ? formatProfileNumber(Math.round(user.ratingAvg))
      : user.ratingAvg > 0
        ? user.ratingAvg.toFixed(1).replace(".", ",")
        : "0";

  return (
    <aside className="flex w-full max-w-[342px] shrink-0 flex-col items-stretch gap-6">
      <div className="relative flex flex-col items-center gap-9 overflow-hidden rounded-[31px] bg-white p-6">
        <div className="relative size-[158px] shrink-0 overflow-hidden rounded-[49px] border-[0.5px] border-solid border-[#8E8BED]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#D9D9D9] text-[48px] font-extrabold text-[#1A1A1A]">
              {user.avatarInitial}
            </div>
          )}
        </div>

        <div className="relative z-[1] flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-1">
            <p className="max-w-[171px] text-center text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#1A1A1A]">
              {user.name}
            </p>
            {user.verified ? (
              <img src={PROFILE_ASSETS.verified} alt="" className="size-[17px] shrink-0" />
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-2 rounded-[16px] border-[0.5px] border-solid border-[#CACACA] bg-white px-5 py-2">
            <img src={PROFILE_ASSETS.pin} alt="" className="h-[12px] w-[9px]" />
            <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              {user.city ?? "Город не указан"}
            </span>
          </div>
        </div>

        <div className="relative z-[1] flex w-full flex-col gap-3">
          <div className="flex h-[95px] w-full flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-6">
            <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              Рейтинг профиля
            </p>
            <div className="flex items-center gap-1">
              <img src={PROFILE_ASSETS.bolt} alt="" className="h-[17px] w-[10px]" />
              <p className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#8E8BED]">
                {ratingDisplay}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-[153px] flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-3">
              <p className="text-center text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                Шоколадки
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="relative size-[17px] overflow-hidden rounded-[8.5px] bg-white">
                  <img
                    src={PROFILE_ASSETS.chocolate}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                </span>
                <p className="text-[20px] font-bold leading-5 tracking-[0.02px] text-[#8E8BED]">0</p>
              </div>
            </div>

            <div className="flex w-[141px] flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-3 text-center">
              <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                Отзывов
              </p>
              <p className="text-[20px] font-bold leading-5 tracking-[0.02px] text-[#8E8BED]">
                {formatProfileNumber(user.ratingCount)}
              </p>
            </div>
          </div>

          <div className="flex h-[72px] w-full flex-col items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#8E8BED] bg-[#F3EDFF] p-6">
            <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
              Обменов
            </p>
            <p className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#8E8BED]">
              {formatProfileNumber(user.swapsCount)}
            </p>
          </div>
        </div>

        <p className="relative z-[1] text-center text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
          {joined ? `На Aimena с ${joined}` : "На Aimena"}
        </p>
      </div>

      <nav className="flex w-full flex-col gap-3">
        {PROFILE_NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={
                isActive
                  ? "relative flex h-[67px] w-full items-center gap-3 rounded-[21px] border-2 border-solid border-transparent bg-white px-6 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#8E8BED_0%,#C8FF00_100%)_border-box]"
                  : "relative flex h-[67px] w-full items-center gap-3 rounded-[21px] bg-white px-6 py-3 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] transition hover:bg-[#FAFAFA]"
              }
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
    </aside>
  );
}
