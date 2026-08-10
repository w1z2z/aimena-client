type ListingCardSkeletonProps = {
  className?: string;
};

export function ListingCardSkeleton({ className }: ListingCardSkeletonProps) {
  return (
    <div
      className={["home-listing-card", "home-listing-card--skeleton", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <div className="home-listing-card__title">
        <span className="listing-skeleton-block listing-skeleton-block--title" />
      </div>
      <div className="home-listing-card__body">
        <div className="home-listing-card__media listing-skeleton-block listing-skeleton-block--media" />
        <div className="home-listing-card__footer">
          <div className="home-listing-card__footer-inner">
            <span className="listing-skeleton-block listing-skeleton-block--pill" />
            <span className="listing-skeleton-block listing-skeleton-block--pill listing-skeleton-block--pill-wide" />
          </div>
        </div>
      </div>
    </div>
  );
}

type ListingCardSkeletonGridProps = {
  count?: number;
  className?: string;
  itemClassName?: string;
};

export function ListingCardSkeletonGrid({
  count = 8,
  className,
  itemClassName,
}: ListingCardSkeletonGridProps) {
  return (
    <div className={className} aria-busy="true" aria-label="Загрузка объявлений">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={itemClassName}>
          <ListingCardSkeleton />
        </div>
      ))}
    </div>
  );
}
