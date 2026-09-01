"use client";

import type { NotificationMediaSide } from "./utils";

function NotificationSideImage({
  side,
  className,
  fallbackClassName,
  freeLabelClassName,
}: {
  side: NotificationMediaSide;
  className: string;
  fallbackClassName: string;
  freeLabelClassName: string;
}) {
  if (side.isFreePlaceholder) {
    return (
      <span className={className} aria-hidden>
        <span className={freeLabelClassName}>Даром</span>
      </span>
    );
  }

  if (side.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={side.coverUrl} alt="" className={className} />
    );
  }

  return (
    <span className={fallbackClassName} aria-hidden>
      {side.thumbTitle.slice(0, 1).toUpperCase()}
    </span>
  );
}

function NotificationGiveBadge({ side }: { side: NotificationMediaSide }) {
  const isFree = side.isFreePlaceholder;

  return (
    <div
      className={[
        "notification-deal-media__badge",
        isFree ? "notification-deal-media__badge--free" : "",
        !isFree && !side.coverUrl ? "notification-deal-media__badge--fallback" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={side.thumbTitle}
    >
      {isFree ? (
        <span className="notification-deal-media__badge-free-label" aria-hidden>
          Д
        </span>
      ) : (
        <NotificationSideImage
          side={side}
          className="notification-deal-media__badge-image"
          fallbackClassName="notification-deal-media__badge-image notification-deal-media__badge-image--fallback"
          freeLabelClassName="notification-deal-media__badge-free-label"
        />
      )}
    </div>
  );
}

function NotificationReceiveThumb({ side }: { side: NotificationMediaSide }) {
  const isFree = side.isFreePlaceholder;

  return (
    <div
      className={[
        "notification-deal-media__item",
        isFree ? "notification-deal-media__item--free" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={side.thumbTitle}
    >
      <NotificationSideImage
        side={side}
        className={[
          "notification-deal-media__thumb",
          isFree ? "notification-deal-media__thumb--free" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        fallbackClassName="notification-deal-media__thumb notification-deal-media__thumb--fallback"
        freeLabelClassName="notification-deal-media__free-label"
      />
      {side.extraCount > 0 ? (
        <span className="notification-deal-media__count">+{side.extraCount}</span>
      ) : null}
    </div>
  );
}

type NotificationDealMediaProps = {
  mine: NotificationMediaSide | null;
  theirs: NotificationMediaSide | null;
};

/** Receive listing (large) + give listing (small circle, top-left). */
export function NotificationDealMedia({
  mine,
  theirs,
}: NotificationDealMediaProps) {
  const receive = theirs;
  const give = mine;

  if (!receive && !give) return null;

  return (
    <div className="notification-deal-media">
      {receive ? (
        <NotificationReceiveThumb side={receive} />
      ) : give ? (
        <NotificationReceiveThumb side={give} />
      ) : null}
      {receive && give ? <NotificationGiveBadge side={give} /> : null}
    </div>
  );
}
