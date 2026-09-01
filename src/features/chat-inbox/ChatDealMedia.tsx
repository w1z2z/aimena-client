"use client";

import { getChatListThumb, getNotificationThumb } from "./utils";
import type { ChatSummary } from "@/shared/api/chats";

function ChatDealThumb({
  title,
  coverUrl,
}: {
  title: string;
  coverUrl: string | null;
}) {
  const className = [
    "chats-list-item__deal-thumb",
    !coverUrl ? "chats-list-item__deal-thumb--fallback" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={coverUrl} alt="" className={className} />
    );
  }

  return (
    <span className={className} aria-hidden>
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

function ChatListAvatar({
  item,
  className,
}: {
  item: ChatSummary;
  className: string;
}) {
  if (item.counterpart.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.counterpart.avatarUrl} alt="" className={className} />
    );
  }

  return (
    <span
      className={[
        className,
        "chats-avatar-placeholder",
        item.kind === "support" ? "chats-list-item__avatar--support" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {item.kind === "support" ? "❤️" : item.counterpart.displayName.slice(0, 1).toUpperCase()}
    </span>
  );
}

function ChatAvatarBadge({ item }: { item: ChatSummary }) {
  const className = [
    "chats-list-item__avatar-badge",
    !item.counterpart.avatarUrl ? "chats-list-item__avatar-badge--fallback" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (item.counterpart.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.counterpart.avatarUrl} alt="" className={className} />
    );
  }

  return (
    <span className={className} aria-hidden>
      {item.counterpart.displayName.slice(0, 1).toUpperCase()}
    </span>
  );
}

type ChatDealMediaProps = {
  item: ChatSummary;
  showAvatarBadge?: boolean;
  preferAvatar?: boolean;
  context?: "chat" | "notification";
  className?: string;
};

/** Listing cover + optional counterpart avatar badge (shared by chat list & notifications). */
export function ChatDealMedia({
  item,
  showAvatarBadge = false,
  preferAvatar = false,
  context = "chat",
  className,
}: ChatDealMediaProps) {
  const thumb = preferAvatar
    ? null
    : context === "notification"
      ? getNotificationThumb(item)
      : getChatListThumb(item);

  if (!thumb) {
    return <ChatListAvatar item={item} className="chats-list-item__avatar" />;
  }

  return (
    <span className={["chats-list-item__deal-media", className].filter(Boolean).join(" ")}>
      <ChatDealThumb title={thumb.thumbTitle} coverUrl={thumb.coverUrl} />
      {showAvatarBadge ? <ChatAvatarBadge item={item} /> : null}
    </span>
  );
}
