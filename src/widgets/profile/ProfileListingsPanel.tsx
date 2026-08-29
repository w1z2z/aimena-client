"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  ListingCard,
  ListingCardSkeletonGrid,
  buildWantCategories,
  buildWantsPreview,
  mapApiConditionToLabel,
  type ListingCardLifecycle,
} from "@/entities/listing";
import { useAuth } from "@/features/auth";
import { getMyListings, type ApiListingCard } from "@/shared/api/listings";
import { ErrorBlock } from "@/shared/ui/ErrorBlock";

import { pluralRu } from "./constants";
import { ProfileListingCardActions } from "./ProfileListingCardActions";
import {
  getProfilePageCount,
  PROFILE_PAGE_SIZE,
  ProfilePagination,
} from "./ProfilePagination";
import {
  ProfileSortControl,
  PROFILE_LISTING_TYPE_OPTIONS,
  type ProfileListingTypeFilter,
  type ProfileSortOrder,
} from "./ProfileSortControl";

const EMPTY_BY_TYPE: Record<ProfileListingTypeFilter, string> = {
  all: "Пока нет объявлений. Разместите первое предложение.",
  active: "Нет активных объявлений.",
  archived: "Нет снятых с публикации объявлений.",
  completed: "Нет завершенных объявлений.",
};

function resolveOwnLifecycle(listing: ApiListingCard): ListingCardLifecycle | null {
  if (listing.isAvailable === false) return "deleted";
  if (listing.status === "completed") return "completed";
  if (listing.status === "archived") return "archived";
  return null;
}

function statusesForTypeFilter(
  typeFilter: ProfileListingTypeFilter,
): ApiListingCard["status"][] {
  if (typeFilter === "all") return ["active", "archived", "completed"];
  return [typeFilter];
}

export function ProfileListingsPanel() {
  const { user, accessToken } = useAuth();
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<ProfileListingTypeFilter>("all");
  const [page, setPage] = useState(1);

  const statusQuery = statusesForTypeFilter(typeFilter);

  useEffect(() => {
    setPage(1);
  }, [sort, typeFilter]);

  const listingsQuery = useQuery({
    queryKey: ["profile-listings-me", user?.id, typeFilter, sort, page],
    queryFn: ({ signal }) =>
      getMyListings(
        { page, pageSize: PROFILE_PAGE_SIZE, status: statusQuery, sort },
        signal,
      ),
    enabled: Boolean(user?.id && accessToken),
    placeholderData: (previous) => previous,
  });

  const listings = listingsQuery.data?.data ?? [];
  const total = listingsQuery.data?.meta.total ?? 0;
  const pageCount =
    listingsQuery.data?.meta.pageCount ?? getProfilePageCount(total);
  const countLabel = `${total} ${pluralRu(total, "объявление", "объявления", "объявлений")}`;

  let body: ReactNode;

  if (!user) {
    body = null;
  } else if (listingsQuery.isLoading && listings.length === 0) {
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
            const lifecycle = resolveOwnLifecycle(listing);
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
                  hideAction
                  hideFavorite
                  imageMuted={Boolean(lifecycle)}
                  titleAccessory={
                    <ProfileListingCardActions listingId={listing.id} status={listing.status} />
                  }
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
          <h1 className="profile-panel__title">Ваши объявления</h1>
          <p className="profile-panel__count">{countLabel}</p>
        </div>
        {user ? (
          <div className="profile-panel__toolbar">
            <ProfileSortControl
              sort={sort}
              onSortChange={setSort}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              typeOptions={PROFILE_LISTING_TYPE_OPTIONS}
              dialogLabel="Сортировка объявлений"
            />
          </div>
        ) : null}
      </div>

      <div className="profile-panel__body">{body}</div>
    </section>
  );
}
