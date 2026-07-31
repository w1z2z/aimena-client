"use client";

import { ListingCard, mapApiListingToCard, useSimilarListings } from "@/entities/listing";

type ListingSimilarSectionProps = {
  listingId: string;
};

export function ListingSimilarSection({ listingId }: ListingSimilarSectionProps) {
  const { data, isLoading, isError } = useSimilarListings(listingId, 12);
  const cards = (data?.data ?? []).map(mapApiListingToCard);

  if (isError) return null;

  return (
    <section className="listing-detail-similar" aria-label="Похожие объявления">
      <h2 className="listing-detail-similar__title">Похожие объявления</h2>

      {isLoading && cards.length === 0 ? (
        <p className="listing-detail-similar__status">Загрузка…</p>
      ) : null}

      {!isLoading && cards.length === 0 ? (
        <p className="listing-detail-similar__status">Похожих объявлений пока нет.</p>
      ) : null}

      {cards.length > 0 ? (
        <div className="listing-detail-similar__grid">
          {cards.map((listing) => (
            <ListingCard
              key={listing.id}
              listingId={listing.id}
              variant="exchange"
              title={listing.title}
              city={listing.city}
              condition={listing.condition}
              coverImageUrl={listing.coverImageUrl}
              wants={listing.wants}
              isFavorite={listing.isFavorite}
              ownerId={listing.ownerId}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function formatEstimatedPrice(price: number | null) {
  if (price == null) return "—";
  return `~${new Intl.NumberFormat("ru-RU").format(price)}\u00A0₽`;
}
