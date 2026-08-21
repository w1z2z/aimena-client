"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ListingCard,
  ListingCardSkeletonGrid,
  excludeOwnListings,
  listingQueryKeys,
  mapApiListingToCard,
} from "@/entities/listing";
import { ErrorBlock } from "@/shared/ui/ErrorBlock";
import { useAuth } from "@/features/auth";
import { getListings } from "@/shared/api/listings";
import { Header } from "@/widgets/header/Header";
import {
  CATALOG_PAGE_SIZE,
  getProfilePageCount,
  ProfilePagination,
} from "@/widgets/profile/ProfilePagination";

function pluralListings(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "объявление";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объявления";
  return "объявлений";
}

export default function FreeGiveawaysPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);

  const listingsQuery = useQuery({
    queryKey: [...listingQueryKeys.all, "free-page", user?.id ?? "anon", page, CATALOG_PAGE_SIZE],
    enabled: !authLoading,
    queryFn: async ({ signal }) => {
      const response = await getListings(
        {
          page,
          pageSize: CATALOG_PAGE_SIZE,
          isFree: true,
          type: ["item"],
        },
        signal,
      );
      return {
        items: excludeOwnListings(response.data.map(mapApiListingToCard), user?.id),
        total: response.meta.total,
        page: response.meta.page,
        pageCount:
          response.meta.pageCount ??
          getProfilePageCount(response.meta.total, CATALOG_PAGE_SIZE),
      };
    },
    placeholderData: (previous) => previous,
  });

  const listings = listingsQuery.data?.items ?? [];
  const total = listingsQuery.data?.total ?? 0;
  const pageCount =
    listingsQuery.data?.pageCount ?? getProfilePageCount(total, CATALOG_PAGE_SIZE);

  let body = (
    <ListingCardSkeletonGrid
      count={CATALOG_PAGE_SIZE}
      className="favorites-page__grid"
      itemClassName="favorites-page__card"
    />
  );

  if (listingsQuery.isError) {
    body = (
      <ErrorBlock
        title="Не удалось загрузить объявления"
        onRetry={() => void listingsQuery.refetch()}
      />
    );
  } else if (!listingsQuery.isLoading && listings.length === 0) {
    body = (
      <div className="favorites-page__empty">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favorites-empty-star.svg"
          alt=""
          className="favorites-page__empty-star"
        />
        <p className="favorites-page__empty-text">
          Пока нет объявлений в разделе «Даром»
        </p>
        <Link href="/" className="favorites-page__empty-cta">
          Перейти в ленту
        </Link>
      </div>
    );
  } else if (listings.length > 0) {
    body = (
      <div className="favorites-page__list">
        <div className="favorites-page__grid" aria-label="Объявления даром">
          {listings.map((listing) => (
            <div key={listing.id} className="favorites-page__card">
              <ListingCard
                listingId={listing.id}
                variant="free"
                title={listing.title}
                city={listing.city}
                condition={listing.condition}
                coverImageUrl={listing.coverImageUrl}
                wantCategories={listing.wantCategories}
                isFree
                isFavorite={listing.isFavorite}
                ownerId={listing.ownerId}
              />
            </div>
          ))}
        </div>
        <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Header />
      <main className="favorites-page__main">
        <h1 className="favorites-page__title">
          Отдаю <span className="text-[#8E8BED]">даром</span>
        </h1>
        {listingsQuery.isSuccess || listings.length > 0 ? (
          <p className="favorites-page__count">
            {total} {pluralListings(total)}
          </p>
        ) : null}
        {body}
      </main>
    </div>
  );
}
