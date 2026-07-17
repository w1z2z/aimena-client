"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { favoriteQueryKeys } from "@/features/favorites";
import { getFavorites } from "@/shared/api/favorites";

const PAGE = 1;
const PAGE_SIZE = 50;

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const favoritesQuery = useQuery({
    queryKey: favoriteQueryKeys.list(PAGE, PAGE_SIZE),
    queryFn: ({ signal }) =>
      getFavorites({ page: PAGE, pageSize: PAGE_SIZE }, signal),
    enabled: isAuthenticated,
  });

  let content = <p>Загрузка...</p>;

  if (!authLoading && !isAuthenticated) {
    content = <p>Войдите в аккаунт, чтобы увидеть избранное.</p>;
  } else if (favoritesQuery.isError) {
    content = <p>Не удалось загрузить избранное.</p>;
  } else if (favoritesQuery.data) {
    content =
      favoritesQuery.data.data.length > 0 ? (
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {favoritesQuery.data.data.map((listing) => (
            <li key={listing.id}>{listing.title}</li>
          ))}
        </ul>
      ) : (
        <p>В избранном пока ничего нет.</p>
      );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-[760px] rounded-[20px] border border-[#e5e5e5] bg-white p-6">
        <h1 className="mb-3 text-[32px] font-bold leading-tight">Избранное</h1>
        {content}
      </section>
    </main>
  );
}
