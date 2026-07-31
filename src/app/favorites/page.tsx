"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ListingCard, mapApiListingToCard } from "@/entities/listing";
import { useAuth } from "@/features/auth";
import { favoriteQueryKeys } from "@/features/favorites";
import { getFavorites } from "@/shared/api/favorites";
import { Header } from "@/widgets/header/Header";

const PAGE = 1;
const PAGE_SIZE = 50;

function pluralOffers(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "предложение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "предложения";
  return "предложений";
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const favoritesQuery = useQuery({
    queryKey: favoriteQueryKeys.list(PAGE, PAGE_SIZE),
    queryFn: ({ signal }) => getFavorites({ page: PAGE, pageSize: PAGE_SIZE }, signal),
    enabled: isAuthenticated,
  });

  const listings = (favoritesQuery.data?.data ?? []).map(mapApiListingToCard);
  const total = favoritesQuery.data?.meta.total ?? listings.length;

  let body = (
    <p className="favorites-page__status">Загрузка…</p>
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
  } else if (isAuthenticated && favoritesQuery.isSuccess && listings.length === 0) {
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
      <div className="favorites-page__grid" aria-label="Избранные объявления">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listingId={listing.id}
            variant="exchange"
            title={listing.title}
            city={listing.city}
            condition={listing.condition}
            coverImageUrl={listing.coverImageUrl}
            wants={listing.wants}
            isFree={listing.isFree}
            isFavorite={listing.isFavorite}
            ownerId={listing.ownerId}
            unavailable={!listing.isAvailable}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Header />
      <main className="favorites-page__main">
        <h1 className="favorites-page__title">Избранное</h1>
        {isAuthenticated && favoritesQuery.isSuccess ? (
          <p className="favorites-page__count">
            {total} {pluralOffers(total)}
          </p>
        ) : null}
        {body}
      </main>
    </div>
  );
}
