"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ListingCard, listingQueryKeys, mapApiListingToCard } from "@/entities/listing";
import { getListings } from "@/shared/api/listings";
import { useInfiniteScrollSentinel } from "@/shared/lib/use-infinite-scroll-sentinel";
import { Header } from "@/widgets/header/Header";

const PAGE_SIZE = 24;

const FREE_QUERY = {
  pageSize: PAGE_SIZE,
  isFree: true as const,
  type: ["item"] as Array<"item">,
};

function pluralOffers(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "предложение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "предложения";
  return "предложений";
}

export default function FreeGiveawaysPage() {
  const listingsQuery = useInfiniteQuery({
    queryKey: [...listingQueryKeys.all, "free-infinite", FREE_QUERY],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const response = await getListings(
        {
          page: pageParam,
          pageSize: PAGE_SIZE,
          isFree: true,
          type: ["item"],
        },
        signal,
      );
      return {
        items: response.data.map(mapApiListingToCard),
        total: response.meta.total,
        page: response.meta.page,
        pageCount: response.meta.pageCount,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined,
  });

  const listings = useMemo(
    () => listingsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listingsQuery.data],
  );
  const total = listingsQuery.data?.pages[0]?.total ?? listings.length;

  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage: Boolean(listingsQuery.hasNextPage),
    isFetchingNextPage: listingsQuery.isFetchingNextPage,
    fetchNextPage: () => {
      if (!listingsQuery.hasNextPage || listingsQuery.isFetchingNextPage) return;
      void listingsQuery.fetchNextPage();
    },
  });

  let body = <p className="favorites-page__status">Загрузка…</p>;

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
              isFree
              isFavorite={listing.isFavorite}
              ownerId={listing.ownerId}
            />
          ))}
        </div>
        <div ref={sentinelRef} className="favorites-page__sentinel" aria-hidden />
        {listingsQuery.isFetchingNextPage ? (
          <p className="favorites-page__loading-more">Загрузка…</p>
        ) : null}
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
