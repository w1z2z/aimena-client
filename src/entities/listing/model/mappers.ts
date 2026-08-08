import type { ApiListingCard, ApiListingDetail } from "@/shared/api/listings";

import { mapApiConditionToLabel } from "./conditions";
import type { ListingCardData, ListingWantCategory } from "./types";

type WantsSource = Pick<ApiListingCard, "wantsText" | "wantsTags" | "wantsCategory">;

/**
 * «Обмен на:» — категория желаемого обмена из `wantsCategory`.
 * Если выбрана подкатегория — только она (без родителя).
 * Теги вещей — в пилюлях внизу (`buildWantsPreview`), не здесь.
 */
export function buildWantCategories(listing: WantsSource): ListingWantCategory[] {
  const wants = listing.wantsCategory;
  const name = wants?.name?.trim();
  if (!wants?.id || !name) return [];

  return [
    {
      id: wants.id,
      name,
      parentId: wants.parent?.id ?? null,
    },
  ];
}

/**
 * Пилюли внизу карточки — конкретные теги (вещи), не категории.
 */
export function buildWantsPreview(listing: WantsSource): string[] {
  const categoryNames = new Set(
    buildWantCategories(listing).map((value) => value.name.toLowerCase()),
  );

  const tags = listing.wantsTags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !categoryNames.has(tag.toLowerCase()));

  if (tags.length > 0) {
    return [...new Map(tags.map((value) => [value.toLowerCase(), value])).values()];
  }

  // Fallback only when tags are empty — parse free-text wants.
  const normalizedTextParts = listing.wantsText
    .split(/[,\n;]+/)
    .map((part) =>
      part
        .replace(/^хочу(?:\s+получить)?(?:\s+взамен)?\s*[:\-]?\s*/i, "")
        .replace(/^ищу\s*/i, "")
        .trim(),
    )
    .filter(Boolean)
    .filter((part) => !categoryNames.has(part.toLowerCase()));

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
