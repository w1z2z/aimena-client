export type ListingCardVariant = "exchange" | "free" | "hero";

export type ListingCardData = {
  id: string;
  title: string;
  city: string;
  condition: string;
  wants: string[];
  wantsMore: number;
  hasDocuments: boolean;
  isFree: boolean;
  price: number;
  coverImageUrl: string | null;
};

export type ListingCardPreview = Pick<
  ListingCardData,
  "id" | "title" | "city" | "condition" | "coverImageUrl"
>;
