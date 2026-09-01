"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { NotificationExchangeLines } from "@/features/chat-inbox/utils";

type NotificationCardProps = {
  title: string;
  subtitle?: string;
  exchangeLines?: NotificationExchangeLines | null;
  time: string;
  href?: string;
  media: ReactNode;
  hasUnread?: boolean;
  onNavigate?: () => void;
};

function NotificationExchangeLineRow({
  label,
  line,
}: {
  label: string;
  line: NonNullable<NotificationExchangeLines>["receive"];
}) {
  if (!line) return null;

  return (
    <p className="notification-card__exchange-line">
      <span className="notification-card__exchange-label">{label}</span>
      <span className="notification-card__exchange-value" title={line.primaryLabel}>
        <span className="notification-card__exchange-title">{line.primaryLabel}</span>
        {line.extraLabel ? (
          <span className="notification-card__exchange-extra">{line.extraLabel}</span>
        ) : null}
      </span>
    </p>
  );
}

export function NotificationCard({
  title,
  subtitle,
  exchangeLines,
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
        {exchangeLines ? (
          <div className="notification-card__exchange">
            <NotificationExchangeLineRow label="Получу:" line={exchangeLines.receive} />
            <NotificationExchangeLineRow label="Отдам:" line={exchangeLines.give} />
          </div>
        ) : null}
        {subtitle ? <p className="notification-card__subtitle">{subtitle}</p> : null}
      </div>
      <span className="notification-card__meta">
        <time className="notification-card__time">{time}</time>
      </span>
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
