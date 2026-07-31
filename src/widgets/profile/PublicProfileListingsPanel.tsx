"use client";

import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ListingCard, mapApiConditionToLabel } from "@/entities/listing";
import { getPublicProfile, getUserListingsBySlug } from "@/shared/api/auth";
import type { ApiListingCard } from "@/shared/api/listings";

import { pluralRu } from "./constants";
import { ProfileSortControl } from "./ProfileSortControl";
import {
  ProfileStatusFilter,
  type ProfileListingStatusFilter,
} from "./ProfileStatusFilter";

const STATUS_LABEL: Partial<Record<ApiListingCard["status"], string>> = {
  active: "Активно",
  archived: "Снято",
};

const EMPTY_BY_STATUS: Record<ProfileListingStatusFilter, string> = {
  all: "Пока нет объявлений.",
  active: "Нет активных объявлений.",
  archived: "Нет снятых с публикации объявлений.",
};

type SortOrder = "newest" | "oldest";

export function PublicProfileListingsPanel() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [sort, setSort] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<ProfileListingStatusFilter>("all");

  const profileQuery = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: ({ signal }) => getPublicProfile(slug, signal),
    enabled: Boolean(slug),
  });

  const showCompleted = profileQuery.data?.profile.showCompletedListings ?? false;

  const statusQuery: ApiListingCard["status"][] =
    statusFilter === "all" ? ["active", "archived"] : [statusFilter];

  const listingsQuery = useQuery({
    queryKey: ["public-profile-listings", slug, statusFilter, sort],
    queryFn: ({ signal }) =>
      getUserListingsBySlug(
        slug,
        { page: 1, pageSize: 50, status: statusQuery, sort },
        signal,
      ),
    enabled: Boolean(slug),
    placeholderData: (previous) => previous,
  });

  const listings = listingsQuery.data?.data ?? [];
  const total = listingsQuery.data?.meta.total ?? listings.length;
  const countLabel = `${total} ${pluralRu(total, "объявление", "объявления", "объявлений")}`;

  let body: ReactNode;

  if (listingsQuery.isLoading && listings.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Загрузка объявлений…</p>;
  } else if (listingsQuery.isError && listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#FF2056]">Не удалось загрузить объявления.</p>
    );
  } else if (listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_STATUS[statusFilter]}</p>
    );
  } else {
    body = (
      <div className="profile-listings-grid grid grid-cols-3 gap-x-6 gap-y-12">
        {listings.map((listing) => (
          <div key={listing.id} className="profile-listing-card-slot">
            <ListingCard
              listingId={listing.id}
              variant="mine"
              title={listing.title}
              city={listing.city.name}
              condition={mapApiConditionToLabel(listing.condition)}
              coverImageUrl={listing.coverImageUrl}
              wants={listing.wantsTags}
              isFree={listing.isFree}
              isFavorite={listing.isFavorite}
              ownerId={listing.ownerId}
              status={showCompleted ? (STATUS_LABEL[listing.status] ?? null) : null}
              imageMuted={listing.status === "archived"}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="pr-14 text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Объявления
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="relative mt-12 w-full overflow-visible">
        <div className="absolute bottom-full right-0 z-30 mb-2 flex items-center gap-3 overflow-visible">
          {showCompleted ? (
            <ProfileStatusFilter value={statusFilter} onChange={setStatusFilter} />
          ) : null}
          <ProfileSortControl value={sort} onChange={setSort} />
        </div>
        {body}
      </div>
    </section>
  );
}
