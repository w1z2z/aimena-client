"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/features/auth";
import { useProfileScrollTracker } from "@/shared/lib/profile-scroll-memory";
import { Header } from "@/widgets/header/Header";

import type { ProfileSection } from "./constants";
import { ProfileSidebar } from "./ProfileSidebar";

type ProfileLayoutProps = {
  active: ProfileSection;
  children: ReactNode;
};

export function ProfileLayout({ active, children }: ProfileLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  useProfileScrollTracker();

  if (isLoading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-page__main">
          <p className="text-[16px] font-semibold text-[#626262]">Загрузка профиля…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-page__main flex flex-col items-start gap-6">
          <h1 className="profile-panel__title">Мой профиль</h1>
          <p className="text-[16px] font-semibold text-[#626262]">
            Войдите в аккаунт, чтобы открыть личный кабинет.
          </p>
          <button
            type="button"
            className="h-12 rounded-[10px] bg-[#8E8BED] px-6 text-[16px] font-extrabold text-white transition hover:brightness-[0.98]"
            onClick={() => router.push("/login")}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-page__main">
        <div className="profile-page__inner">
          <ProfileSidebar user={user} active={active} />
          <div className="profile-page__content">{children}</div>
        </div>
      </div>
    </div>
  );
}
