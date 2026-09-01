"use client";

import type { NotificationMediaSide } from "./utils";

function NotificationListingThumb({
  side,
  showFreeBadge = false,
}: {
  side: NotificationMediaSide;
  showFreeBadge?: boolean;
}) {
  const className = [
    "notification-deal-media__thumb",
    !side.coverUrl ? "notification-deal-media__thumb--fallback" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className="notification-deal-media__item" title={side.thumbTitle}>
      {side.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={side.coverUrl} alt="" className={className} />
      ) : (
        <span className={className} aria-hidden>
          {side.thumbTitle.slice(0, 1).toUpperCase()}
        </span>
      )}
      {side.extraCount > 0 ? (
        <span className="notification-deal-media__count">+{side.extraCount}</span>
      ) : null}
      {showFreeBadge ? (
        <span className="notification-deal-media__free-badge">Даром</span>
      ) : null}
    </span>
  );
}

type NotificationDealMediaProps = {
  mine: NotificationMediaSide | null;
  theirs: NotificationMediaSide | null;
  isFreeClaim: boolean;
};

export function NotificationDealMedia({
  mine,
  theirs,
  isFreeClaim,
}: NotificationDealMediaProps) {
  if (isFreeClaim) {
    const listing = mine ?? theirs;
    if (!listing) return null;

    return (
      <div className="notification-deal-media notification-deal-media--free">
        <NotificationListingThumb side={listing} showFreeBadge />
      </div>
    );
  }

  if (!mine && !theirs) return null;

  return (
    <div className="notification-deal-media">
      {mine ? <NotificationListingThumb side={mine} /> : null}
      {mine && theirs ? (
        <span className="notification-deal-media__swap" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/profile/icon-swap-alt.svg" alt="" width={14} height={13} />
        </span>
      ) : null}
      {theirs ? <NotificationListingThumb side={theirs} /> : null}
    </div>
  );
}
