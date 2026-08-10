export function ListingDetailSkeleton() {
  return (
    <div className="listing-detail-layout" aria-busy="true" aria-label="Загрузка объявления">
      <div className="listing-detail-layout__left">
        <div className="listing-detail-skeleton__gallery">
          <div className="listing-skeleton-block listing-detail-skeleton__gallery-main" />
          <div className="listing-detail-skeleton__thumbs">
            <span className="listing-skeleton-block listing-detail-skeleton__thumb" />
            <span className="listing-skeleton-block listing-detail-skeleton__thumb" />
            <span className="listing-skeleton-block listing-detail-skeleton__thumb" />
          </div>
        </div>
        <div className="listing-detail-skeleton__owner">
          <span className="listing-skeleton-block listing-detail-skeleton__avatar" />
          <div className="listing-detail-skeleton__owner-meta">
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--md" />
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
          </div>
        </div>
      </div>

      <div className="listing-detail-layout__right">
        <div className="listing-detail-heading">
          <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--xs" />
          <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--title" />
          <div className="listing-detail-heading__tags">
            <span className="listing-skeleton-block listing-detail-skeleton__pill" />
            <span className="listing-skeleton-block listing-detail-skeleton__pill" />
          </div>
        </div>

        <div className="listing-detail-stats">
          <div className="listing-detail-stat listing-detail-skeleton__stat">
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
            <span className="listing-skeleton-block listing-detail-skeleton__pill" />
          </div>
          <div className="listing-detail-stat listing-detail-skeleton__stat">
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
            <span className="listing-skeleton-block listing-detail-skeleton__pill" />
          </div>
          <div className="listing-detail-stat listing-detail-skeleton__stat">
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
            <span className="listing-skeleton-block listing-detail-skeleton__pill" />
          </div>
        </div>

        <div className="listing-detail-wants">
          <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--title" />
          <div className="listing-detail-wants__card listing-detail-skeleton__wants-card">
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
            <div className="listing-detail-heading__tags">
              <span className="listing-skeleton-block listing-detail-skeleton__pill" />
              <span className="listing-skeleton-block listing-detail-skeleton__pill listing-detail-skeleton__pill--wide" />
              <span className="listing-skeleton-block listing-detail-skeleton__pill" />
            </div>
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--sm" />
            <div className="listing-detail-heading__tags">
              <span className="listing-skeleton-block listing-detail-skeleton__pill listing-detail-skeleton__pill--wide" />
              <span className="listing-skeleton-block listing-detail-skeleton__pill" />
            </div>
          </div>
        </div>

        <div className="listing-detail-description">
          <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--title" />
          <div className="listing-detail-description__card listing-detail-skeleton__description-card">
            <span className="listing-skeleton-block listing-detail-skeleton__line" />
            <span className="listing-skeleton-block listing-detail-skeleton__line" />
            <span className="listing-skeleton-block listing-detail-skeleton__line listing-detail-skeleton__line--md" />
          </div>
        </div>
      </div>
    </div>
  );
}
