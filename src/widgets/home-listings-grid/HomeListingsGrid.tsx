import { ExchangeListingCard, type ExchangeListingCardData } from "./ExchangeListingCard";
import { ITEMS_PER_PAGE, TOTAL_ITEMS } from "./HomeListingsPagination";

const listings: ExchangeListingCardData[] = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: index + 1,
  title: 'MacBook Pro 14" M3 Хо',
  city: "Москва",
  condition: "Хорошее",
  wants: ["Sony PlayStation 5", "Монитор 4K"],
  wantsMore: 5,
}));

type HomeListingsGridProps = {
  page: number;
};

export function HomeListingsGrid({ page }: HomeListingsGridProps) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visibleListings = listings.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="home-listings-grid" aria-label="Лента объявлений">
      {visibleListings.map((listing) => (
        <ExchangeListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}
