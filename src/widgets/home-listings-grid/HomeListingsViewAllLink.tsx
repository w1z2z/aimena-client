import Link from "next/link";

export function HomeListingsViewAllLink() {
  return (
    <div className="home-listings-view-all">
      <Link href="/listings" className="home-listings-view-all__link">
        Смотреть все
      </Link>
    </div>
  );
}
