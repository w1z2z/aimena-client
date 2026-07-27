"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/features/auth";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F5]">
        <Header />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-18">
          <p className="text-[16px] font-semibold text-[#626262]">Загрузка профиля…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F8F5]">
        <Header />
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-6 pb-12 pt-18">
          <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
            Мой профиль
          </h1>
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
    <div className="min-h-screen bg-[#F8F8F5]">
      <Header />
      {/* px снаружи: внутри ровно 1440 = сайдбар 342 + gap 24 + контент 1074 */}
      <div className="px-6 pb-12 pt-18">
        <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6">
          <ProfileSidebar user={user} active={active} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
