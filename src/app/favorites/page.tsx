"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  ListingCard,
  ListingCardSkeletonGrid,
  mapApiListingToCard,
} from "@/entities/listing";
import { useAuth } from "@/features/auth";
import { favoriteQueryKeys } from "@/features/favorites";
import { getFavorites, removeInactiveFavorites } from "@/shared/api/favorites";
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

export default function FavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);

  const favoritesQuery = useQuery({
    queryKey: favoriteQueryKeys.list(page, CATALOG_PAGE_SIZE),
    enabled: isAuthenticated,
    queryFn: async ({ signal }) => {
      const response = await getFavorites(
        { page, pageSize: CATALOG_PAGE_SIZE },
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

  const removeInactiveMutation = useMutation({
    mutationFn: removeInactiveFavorites,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
      setPage(1);
    },
  });

  const listings = favoritesQuery.data?.items ?? [];
  const total = favoritesQuery.data?.total ?? 0;
  const pageCount =
    favoritesQuery.data?.pageCount ?? getProfilePageCount(total, CATALOG_PAGE_SIZE);
  const hasInactive = listings.some((listing) => !listing.isAvailable);

  let body = (
    <ListingCardSkeletonGrid count={CATALOG_PAGE_SIZE} className="favorites-page__grid" />
  );

  if (!authLoading && !isAuthenticated) {
    body = (
      <div className="favorites-page__login">
        <p className="favorites-page__status" style={{ margin: 0 }}>
          Войдите в аккаунт, чтобы увидеть избранное.
        </p>
        <button
          type="button"
          className="favorites-page__login-btn"
          onClick={() => router.push("/login")}
        >
          Войти
        </button>
      </div>
    );
  } else if (isAuthenticated && favoritesQuery.isError) {
    body = (
      <p className="favorites-page__status favorites-page__status--error">
        Не удалось загрузить избранное.
      </p>
    );
  } else if (isAuthenticated && !favoritesQuery.isLoading && listings.length === 0) {
    body = (
      <div className="favorites-page__empty">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favorites-empty-star.svg"
          alt=""
          className="favorites-page__empty-star"
        />
        <p className="favorites-page__empty-text">
          Здесь будут объявления, которые вам понравились
        </p>
        <Link href="/" className="favorites-page__empty-cta">
          Перейти в ленту
        </Link>
      </div>
    );
  } else if (isAuthenticated && listings.length > 0) {
    body = (
      <div className="favorites-page__list">
        {hasInactive ? (
          <div className="favorites-page__toolbar">
            <button
              type="button"
              className="favorites-page__clear-inactive"
              disabled={removeInactiveMutation.isPending}
              onClick={() => removeInactiveMutation.mutate()}
            >
              {removeInactiveMutation.isPending ? "Удаление…" : "Удалить неактивные"}
            </button>
          </div>
        ) : null}
        <div className="favorites-page__grid" aria-label="Избранные объявления">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listingId={listing.id}
              variant={listing.isFree ? "free" : "exchange"}
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
              coverImageUrl={listing.coverImageUrl}
              wants={listing.wants}
              wantCategories={listing.wantCategories}
              isFree={listing.isFree}
              isFavorite={listing.isFavorite}
              ownerId={listing.ownerId}
              unavailable={!listing.isAvailable}
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
        <h1 className="favorites-page__title">Избранное</h1>
        {isAuthenticated && (listings.length > 0 || favoritesQuery.isSuccess) ? (
          <p className="favorites-page__count">
            {total} {pluralOffers(total)}
          </p>
        ) : null}
        {body}
      </main>
    </div>
  );
}
