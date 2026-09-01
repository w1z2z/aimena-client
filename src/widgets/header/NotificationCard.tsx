"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type NotificationCardProps = {
  title: string;
  counterpartName: string;
  time: string;
  href?: string;
  media: ReactNode;
  hasUnread?: boolean;
  onNavigate?: () => void;
};

export function NotificationCard({
  title,
  counterpartName,
  time,
  href,
  media,
  hasUnread = false,
  onNavigate,
}: NotificationCardProps) {
  const content = (
    <>
      <div className="notification-card__media">
        {media}
        {hasUnread ? <span aria-hidden className="unread-dot unread-dot--avatar" /> : null}
      </div>
      <div className="notification-card__copy">
        <p className="notification-card__title">{title}</p>
        <p className="notification-card__counterpart">{counterpartName}</p>
        <time className="notification-card__time">{time}</time>
      </div>
    </>
  );

  const className = "notification-card";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          onNavigate?.();
        }}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
