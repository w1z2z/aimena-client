"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ListingCard,
  ListingCardSkeletonGrid,
  listingQueryKeys,
  mapApiListingToCard,
} from "@/entities/listing";
import { getListings } from "@/shared/api/listings";
import { Header } from "@/widgets/header/Header";
import {
  CATALOG_PAGE_SIZE,
  getProfilePageCount,
  ProfilePagination,
} from "@/widgets/profile/ProfilePagination";

function pluralOffers(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "предложение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "предложения";
  return "предложений";
}

export default function FreeGiveawaysPage() {
  const [page, setPage] = useState(1);

  const listingsQuery = useQuery({
    queryKey: [...listingQueryKeys.all, "free-page", page, CATALOG_PAGE_SIZE],
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
        items: response.data.map(mapApiListingToCard),
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
    <ListingCardSkeletonGrid count={CATALOG_PAGE_SIZE} className="favorites-page__grid" />
  );

  if (listingsQuery.isError) {
    body = (
      <p className="favorites-page__status favorites-page__status--error">
        Не удалось загрузить объявления.
      </p>
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
            <ListingCard
              key={listing.id}
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
            {total} {pluralOffers(total)}
          </p>
        ) : null}
        {body}
      </main>
    </div>
  );
}
