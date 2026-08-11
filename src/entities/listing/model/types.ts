export type ListingCardVariant = "exchange" | "free" | "hero" | "mine";

/** Inactive own/public listing footer states from Figma. */
export type ListingCardLifecycle = "archived" | "completed" | "deleted";

/** Desired-exchange category chip for «Обмен на:» (leaf name; ids for filter prefill). */
export type ListingWantCategory = {
  id: string;
  name: string;
  /** Parent category id when this is a subcategory; null for top-level. */
  parentId: string | null;
};

export type ListingCardData = {
  id: string;
  ownerId: string;
  title: string;
  city: string;
  condition: string;
  /** Specific want tags (pills under the divider). */
  wants: string[];
  /** Desired-exchange category after «Обмен на:» (leaf category / subcategory). */
  wantCategories: ListingWantCategory[];
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
  archived: "Объявление снято с публикации",
  completed: "Объявление завершено",
  deleted: "Объявление удалено",
};
