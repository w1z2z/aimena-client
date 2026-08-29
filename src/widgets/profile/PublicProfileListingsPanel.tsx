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
import { ErrorBlock } from "@/shared/ui/ErrorBlock";

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
        className="profile-listings-grid"
        itemClassName="profile-listing-card-slot"
      />
    );
  } else if (listingsQuery.isError && listings.length === 0) {
    body = (
      <ErrorBlock
        title="Не удалось загрузить объявления"
        onRetry={() => void listingsQuery.refetch()}
      />
    );
  } else if (listings.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_TYPE[typeFilter]}</p>
    );
  } else {
    body = (
      <>
        <div className="profile-listings-grid">
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
    <section className="profile-panel">
      <div className="profile-panel__header">
        <div className="profile-panel__heading">
          <h1 className="profile-panel__title">Объявления</h1>
          <p className="profile-panel__count">{countLabel}</p>
        </div>
        <div className="profile-panel__toolbar">
          <ProfileSortControl
            sort={sort}
            onSortChange={setSort}
            typeFilter={showCompleted ? typeFilter : undefined}
            onTypeChange={showCompleted ? setTypeFilter : undefined}
            typeOptions={showCompleted ? PUBLIC_LISTING_TYPE_OPTIONS : undefined}
            dialogLabel="Сортировка объявлений"
          />
        </div>
      </div>

      <div className="profile-panel__body">{body}</div>
    </section>
  );
}
