"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { getPublicProfile } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { Header } from "@/widgets/header/Header";

import type { PublicProfileSection } from "./constants";
import { PublicProfileSidebar } from "./PublicProfileSidebar";

type PublicProfileLayoutProps = {
  children: ReactNode;
};

function resolveActiveSection(pathname: string): PublicProfileSection {
  if (pathname.endsWith("/deals")) return "deals";
  if (pathname.endsWith("/reviews")) return "reviews";
  return "listings";
}

export function PublicProfileLayout({ children }: PublicProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { user } = useAuth();
  const active = resolveActiveSection(pathname);

  useEffect(() => {
    if (user?.slug && slug && user.slug === slug) {
      const ownPath =
        active === "deals"
          ? "/profile/deals"
          : active === "reviews"
            ? "/profile/reviews"
            : "/profile";
      router.replace(ownPath);
    }
  }, [active, router, slug, user?.slug]);

  const profileQuery = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: ({ signal }) => getPublicProfile(slug, signal),
    enabled: Boolean(slug) && user?.slug !== slug,
  });

  useEffect(() => {
    if (
      active === "deals" &&
      profileQuery.data?.profile &&
      !profileQuery.data.profile.showCompletedListings
    ) {
      router.replace(`/users/${slug}`);
    }
  }, [active, profileQuery.data?.profile, router, slug]);

  if (user?.slug && user.slug === slug) {
    return (
      <div className="min-h-screen bg-[#F8F8F5]">
        <Header />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-18">
          <p className="text-[16px] font-semibold text-[#626262]">Переход в ваш профиль…</p>
        </div>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F5]">
        <Header />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-18">
          <p className="text-[16px] font-semibold text-[#626262]">Загрузка профиля…</p>
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data?.profile) {
    const notFound =
      profileQuery.error instanceof ApiError && profileQuery.error.status === 404;
    return (
      <div className="min-h-screen bg-[#F8F8F5]">
        <Header />
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-4 px-6 pb-12 pt-18">
          <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
            {notFound ? "Профиль не найден" : "Не удалось загрузить профиль"}
          </h1>
          <p className="text-[16px] font-semibold text-[#626262]">
            {notFound
              ? "Такого пользователя нет или профиль недоступен."
              : "Попробуйте обновить страницу чуть позже."}
          </p>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data.profile;

  return (
    <div className="min-h-screen bg-[#F8F8F5]">
      <Header />
      <div className="px-6 pb-12 pt-18">
        <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6">
          <PublicProfileSidebar profile={profile} active={active} />
          <div className="relative min-w-0 w-[1074px] shrink-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
