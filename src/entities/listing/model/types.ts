export type ListingCardVariant = "exchange" | "free" | "hero" | "mine";

export type ListingCardData = {
  id: string;
  ownerId: string;
  title: string;
  city: string;
  condition: string;
  wants: string[];
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
