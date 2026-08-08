import type { ApiListingCard, ApiListingDetail } from "@/shared/api/listings";

import { mapApiConditionToLabel } from "./conditions";
import type { ListingCardData } from "./types";

type WantsSource = Pick<ApiListingCard, "wantsText" | "wantsTags" | "wantsCategory">;

export function buildWantCategories(listing: WantsSource): string[] {
  const categories: string[] = [];
  const parentName = listing.wantsCategory?.parent?.name?.trim();
  const name = listing.wantsCategory?.name?.trim();
  if (parentName) categories.push(parentName);
  if (name && name.toLowerCase() !== parentName?.toLowerCase()) {
    categories.push(name);
  }
  return categories.slice(0, 3);
}

export function buildWantsPreview(listing: WantsSource): string[] {
  const tags = listing.wantsTags.map((tag) => tag.trim()).filter(Boolean);
  if (tags.length > 0) {
    return [...new Map(tags.map((value) => [value.toLowerCase(), value])).values()];
  }

  const normalizedTextParts = listing.wantsText
    .split(/[,\n;]+/)
    .map((part) =>
      part
        .replace(/^хочу(?:\s+получить)?(?:\s+взамен)?\s*[:\-]?\s*/i, "")
        .replace(/^ищу\s*/i, "")
        .trim(),
    )
    .filter(Boolean);

  return [...new Map(normalizedTextParts.map((value) => [value.toLowerCase(), value])).values()];
}

export const EXTRA_PAY_LABELS: Record<ApiListingDetail["extraPay"], string> = {
  none: "Без доплаты",
  i_pay: "Готов доплатить",
  they_pay: "Хочу доплату",
  both: "В обе стороны",
};

export function mapApiListingToCard(listing: ApiListingCard): ListingCardData {
  return {
    id: listing.id,
    ownerId: listing.ownerId,
    title: listing.title,
    city: listing.city.name,
    condition: mapApiConditionToLabel(listing.condition),
    wants: buildWantsPreview(listing),
    wantCategories: buildWantCategories(listing),
    hasDocuments: listing.hasDocuments,
    isFree: listing.isFree,
    price: listing.estimatedPrice ?? 0,
    coverImageUrl: listing.coverImageUrl,
    isFavorite: listing.isFavorite,
    isAvailable: listing.isAvailable !== false,
  };
}
