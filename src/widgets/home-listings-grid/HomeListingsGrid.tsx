import { ExchangeListingCard, type ExchangeListingCardData } from "./ExchangeListingCard";

const listings: ExchangeListingCardData[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: 'MacBook Pro 14" M3 Хо',
  city: "Москва",
  condition: "Хорошее",
  wants: ["Sony PlayStation 5", "Монитор 4K"],
  wantsMore: 5,
}));

export function HomeListingsGrid() {
  return (
    <div className="home-listings-grid" aria-label="Лента объявлений">
      {listings.map((listing) => (
        <ExchangeListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}
