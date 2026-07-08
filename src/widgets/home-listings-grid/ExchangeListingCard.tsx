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
};

export function ExchangeListingCard({
  title,
  city,
  condition,
  wants,
  wantsMore,
  coverImageUrl,
}: Omit<ExchangeListingCardData, "id">) {
  return (
    <ListingCard
      variant="exchange"
      title={title}
      city={city}
      condition={condition}
      coverImageUrl={coverImageUrl}
      wants={wants}
      wantsMore={wantsMore}
    />
  );
}
