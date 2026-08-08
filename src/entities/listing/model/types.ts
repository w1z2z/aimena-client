export type ListingCardVariant = "exchange" | "free" | "hero" | "mine";

/** Inactive own/public listing footer states from Figma. */
export type ListingCardLifecycle = "archived" | "completed" | "deleted";

export type ListingCardData = {
  id: string;
  ownerId: string;
  title: string;
  city: string;
  condition: string;
  /** Specific want tags (pills). */
  wants: string[];
  /** Want category labels shown after «Обмен на:». */
  wantCategories: string[];
  hasDocuments: boolean;
  isFree: boolean;
  price: number;
  coverImageUrl: string | null;
  isFavorite: boolean;
  isAvailable: boolean;
};

export type ListingCardPreview = Pick<
  ListingCardData,
  "id" | "ownerId" | "title" | "city" | "condition" | "coverImageUrl" | "isFavorite"
>;

export const LISTING_LIFECYCLE_MESSAGE: Record<ListingCardLifecycle, string> = {
  archived: "Объявление в архиве",
  completed: "Объявление завершено",
  deleted: "Объявление удалено",
};
