"use client";

import { ListingCard } from "@/entities/listing";

export type ExchangeListingCardData = {
  id: string;
  title: string;
  city: string;
  condition: string;
  wants: string[];
  wantsMore: number;
  coverImageUrl?: string | null;
  isFavorite: boolean;
};

export function ExchangeListingCard({
  id,
  title,
  city,
  condition,
  wants,
  wantsMore,
  coverImageUrl,
  isFavorite,
}: ExchangeListingCardData) {
  return (
    <ListingCard
      listingId={id}
      variant="exchange"
      title={title}
      city={city}
      condition={condition}
      coverImageUrl={coverImageUrl}
      wants={wants}
      wantsMore={wantsMore}
      isFavorite={isFavorite}
    />
  );
}
