"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { ListingCard, mapApiConditionToLabel } from "@/entities/listing";
import { useAuth } from "@/features/auth";
import { getMyListings, type ApiListingCard } from "@/shared/api/listings";

import { pluralRu } from "./constants";
import { ProfileSortControl } from "./ProfileSortControl";
import {
  ProfileStatusFilter,
  type ProfileListingStatusFilter,
} from "./ProfileStatusFilter";

const STATUS_LABEL: Partial<Record<ApiListingCard["status"], string>> = {
  active: "Активно",
  archived: "Завершено",
};

const EMPTY_BY_STATUS: Record<ProfileListingStatusFilter, string> = {
  all: "Пока нет объявлений. Разместите первое предложение.",
  active: "Нет активных объявлений.",
  archived: "Нет завершённых объявлений.",
};

export function ProfileListingsPanel() {
  const { user, accessToken } = useAuth();
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<ProfileListingStatusFilter>("all");

  const statusQuery: ApiListingCard["status"][] =
    statusFilter === "all" ? ["active", "archived"] : [statusFilter];

  const listingsQuery = useQuery({
    queryKey: ["profile-listings-me", user?.id, statusFilter],
    queryFn: ({ signal }) =>
      getMyListings({ page: 1, pageSize: 50, status: statusQuery }, signal),
    enabled: Boolean(user?.id && accessToken),
  });

  const listings = useMemo(() => {
    const items = listingsQuery.data?.data ?? [];
    const sorted = [...items].sort((a, b) => {
      const aTime = new Date(a.publishedAt ?? a.createdAt).getTime();
      const bTime = new Date(b.publishedAt ?? b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [listingsQuery.data?.data, sort]);

  const total = listingsQuery.data?.meta.total ?? listings.length;
  const countLabel = `${total} ${pluralRu(total, "объявление", "объявления", "объявлений")}`;

  let body: ReactNode;

  if (!user) {
    body = null;
  } else if (listingsQuery.isLoading) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Загрузка объявлений…</p>;
  } else if (listingsQuery.isError) {
    body = (
      <p className="text-[16px] font-semibold text-[#FF2056]">Не удалось загрузить объявления.</p>
    );
  } else if (listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_STATUS[statusFilter]}</p>
    );
  } else {
    body = (
      <div className="grid grid-cols-3 gap-x-6 gap-y-12">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listingId={listing.id}
            variant="mine"
            title={listing.title}
            city={listing.city.name}
            condition={mapApiConditionToLabel(listing.condition)}
            coverImageUrl={listing.coverImageUrl}
            wants={listing.wantsTags}
            isFavorite={listing.isFavorite}
            status={STATUS_LABEL[listing.status] ?? null}
            hideAction
          />
        ))}
      </div>
    );
  }

  return (
    // Figma Frame 32680: 1074px = 342×3 + 24×2
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Ваши объявления
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      {/* 48px от счётчика до карточек; фильтр/сортировка — 8px над сеткой */}
      <div className="relative mt-12 w-full">
        <div className="absolute bottom-full right-0 mb-2 flex items-center gap-3">
          <ProfileStatusFilter value={statusFilter} onChange={setStatusFilter} />
          <ProfileSortControl value={sort} onChange={setSort} />
        </div>
        {body}
      </div>
    </section>
  );
}
