import type { ApiListingCard } from "@/shared/api/listings";

import { mapApiConditionToLabel } from "./conditions";
import type { ListingCardData } from "./types";

function buildWantsPreview(listing: ApiListingCard): string[] {
  const normalizedTextParts = listing.wantsText
    .split(/[,\n;]+/)
    .map((part) =>
      part
        .replace(/^хочу(?:\s+получить)?(?:\s+взамен)?\s*[:\-]?\s*/i, "")
        .replace(/^ищу\s*/i, "")
        .trim(),
    )
    .filter(Boolean);

  const candidates: string[] = [];

  if (normalizedTextParts.length > 0) {
    candidates.push(...normalizedTextParts);
  } else if (listing.wantsCategory?.name?.trim()) {
    candidates.push(listing.wantsCategory.name.trim());
  }

  const tags = listing.wantsTags.map((tag) => tag.trim()).filter(Boolean);
  candidates.push(...tags);

  return [...new Map(candidates.map((value) => [value.toLowerCase(), value])).values()];
}

export function mapApiListingToCard(listing: ApiListingCard): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    city: listing.city.name,
    condition: mapApiConditionToLabel(listing.condition),
    wants: buildWantsPreview(listing),
    hasDocuments: listing.hasDocuments,
    isFree: listing.isFree,
    price: listing.estimatedPrice ?? 0,
    coverImageUrl: listing.coverImageUrl,
    isFavorite: listing.isFavorite,
  };
}
