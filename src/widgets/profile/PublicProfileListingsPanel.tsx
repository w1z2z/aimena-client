"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  ListingCard,
  ListingCardSkeletonGrid,
  buildWantCategories,
  buildWantsPreview,
  mapApiConditionToLabel,
  type ListingCardLifecycle,
} from "@/entities/listing";
import { getPublicProfile, getUserListingsBySlug } from "@/shared/api/auth";
import type { ApiListingCard } from "@/shared/api/listings";

import { pluralRu } from "./constants";
import {
  getProfilePageCount,
  PROFILE_PAGE_SIZE,
  ProfilePagination,
} from "./ProfilePagination";
import {
  ProfileSortControl,
  PUBLIC_LISTING_TYPE_OPTIONS,
  type PublicProfileListingTypeFilter,
  type ProfileSortOrder,
} from "./ProfileSortControl";

const EMPTY_BY_TYPE: Record<PublicProfileListingTypeFilter, string> = {
  all: "Пока нет объявлений.",
  active: "Нет активных объявлений.",
  completed: "Нет завершенных объявлений.",
};

function resolvePublicLifecycle(listing: ApiListingCard): ListingCardLifecycle | null {
  if (listing.isAvailable === false) return "deleted";
  if (listing.status === "completed") return "completed";
  if (listing.status === "archived") return "archived";
  return null;
}

function statusesForPublicTypeFilter(
  typeFilter: PublicProfileListingTypeFilter,
  showCompleted: boolean,
): ApiListingCard["status"][] {
  if (typeFilter === "all") {
    return showCompleted ? ["active", "completed"] : ["active"];
  }
  return [typeFilter];
}

export function PublicProfileListingsPanel() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<PublicProfileListingTypeFilter>("all");
  const [page, setPage] = useState(1);

  const profileQuery = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: ({ signal }) => getPublicProfile(slug, signal),
    enabled: Boolean(slug),
  });

  const showCompleted = profileQuery.data?.profile.showCompletedListings ?? false;

  const statusQuery = statusesForPublicTypeFilter(typeFilter, showCompleted);

  useEffect(() => {
    setPage(1);
  }, [sort, typeFilter, showCompleted]);

  useEffect(() => {
    if (!showCompleted && typeFilter === "completed") {
      setTypeFilter("all");
    }
  }, [showCompleted, typeFilter]);

  const listingsQuery = useQuery({
    queryKey: ["public-profile-listings", slug, typeFilter, sort, showCompleted, page],
    queryFn: ({ signal }) =>
      getUserListingsBySlug(
        slug,
        { page, pageSize: PROFILE_PAGE_SIZE, status: statusQuery, sort },
        signal,
      ),
    enabled: Boolean(slug),
    placeholderData: (previous) => previous,
  });

  const listings = listingsQuery.data?.data ?? [];
  const total = listingsQuery.data?.meta.total ?? 0;
  const pageCount =
    listingsQuery.data?.meta.pageCount ?? getProfilePageCount(total);
  const countLabel = `${total} ${pluralRu(total, "объявление", "объявления", "объявлений")}`;

  let body: ReactNode;

  if (listingsQuery.isLoading && listings.length === 0) {
    body = (
      <ListingCardSkeletonGrid
        count={PROFILE_PAGE_SIZE}
        className="profile-listings-grid grid grid-cols-3 gap-x-6 gap-y-12"
        itemClassName="profile-listing-card-slot"
      />
    );
  } else if (listingsQuery.isError && listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#FF2056]">Не удалось загрузить объявления.</p>
    );
  } else if (listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_TYPE[typeFilter]}</p>
    );
  } else {
    body = (
      <>
        <div className="profile-listings-grid grid grid-cols-3 gap-x-6 gap-y-12">
          {listings.map((listing) => {
            const lifecycle = resolvePublicLifecycle(listing);
            return (
              <div key={listing.id} className="profile-listing-card-slot">
                <ListingCard
                  listingId={listing.id}
                  variant="mine"
                  title={listing.title}
                  city={listing.city.name}
                  condition={mapApiConditionToLabel(listing.condition)}
                  coverImageUrl={listing.coverImageUrl}
                  wants={buildWantsPreview(listing)}
                  wantCategories={buildWantCategories(listing)}
                  isFree={listing.isFree}
                  isFavorite={listing.isFavorite}
                  ownerId={listing.ownerId}
                  lifecycle={lifecycle}
                  imageMuted={Boolean(lifecycle)}
                />
              </div>
            );
          })}
        </div>
        <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
      </>
    );
  }

  return (
    <section className="flex w-full flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          Объявления
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="relative mt-12 w-full overflow-visible">
        <div className="absolute bottom-full right-0 z-30 mb-2 flex items-center overflow-visible">
          <ProfileSortControl
            sort={sort}
            onSortChange={setSort}
            typeFilter={showCompleted ? typeFilter : undefined}
            onTypeChange={showCompleted ? setTypeFilter : undefined}
            typeOptions={showCompleted ? PUBLIC_LISTING_TYPE_OPTIONS : undefined}
            dialogLabel="Сортировка объявлений"
          />
        </div>
        {body}
      </div>
    </section>
  );
}
