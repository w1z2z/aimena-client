"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

import {
  findChatListGroup,
  formatChatListTime,
  getChatListDealLine,
  getChatListPreviewLine,
  getChatListThumb,
  groupChatSummaries,
  truncateChatListLabel,
  type ChatListGroup,
} from "@/features/chat-inbox";
import type { ChatSummary } from "@/shared/api/chats";
import { pluralRu } from "@/widgets/profile/constants";

function ChatListAvatar({
  item,
  className,
}: {
  item: ChatSummary;
  className: string;
}) {
  if (item.counterpart.avatarUrl) {
    return (
      // Storage URL is dynamic and configured by the API.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.counterpart.avatarUrl}
        alt=""
        className={className}
      />
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

function ChatListAvatarBadge({ item }: { item: ChatSummary }) {
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

function ChatListDealMedia({
  item,
  showAvatarBadge = false,
}: {
  item: ChatSummary;
  showAvatarBadge?: boolean;
}) {
  const thumb = getChatListThumb(item);

  if (!thumb) {
    return <ChatListAvatar item={item} className="chats-list-item__avatar" />;
  }

  return (
    <span className="chats-list-item__deal-media">
      <ChatListDealThumb title={thumb.thumbTitle} coverUrl={thumb.coverUrl} />
      {showAvatarBadge ? <ChatListAvatarBadge item={item} /> : null}
    </span>
  );
}

function ChatListDealThumb({
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

function ChatListDealText({
  dealLine,
  className,
  titleClassName,
}: {
  dealLine: NonNullable<ReturnType<typeof getChatListDealLine>>;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <span className={className} title={dealLine.primaryLabel}>
      <span className={titleClassName ?? "chats-list-item__deal-title"}>
        {truncateChatListLabel(dealLine.primaryLabel)}
      </span>
      {dealLine.extraLabel ? (
        <span className="chats-list-group__count">{dealLine.extraLabel}</span>
      ) : null}
    </span>
  );
}

function ChatListDealLabel({ item }: { item: ChatSummary }) {
  const dealLine = getChatListDealLine(item);
  if (!dealLine) return null;
  return <ChatListDealText dealLine={dealLine} className="chats-list-item__deal" />;
}

function ChatListBadges({ item }: { item: ChatSummary }) {
  if (item.kind === "offer" && item.notificationKind !== "offer_rejected") {
    return <span className="chat-badge chat-badge--offer">!</span>;
  }
  if (item.unreadCount > 0) {
    return <span className="chat-badge chat-badge--count">{item.unreadCount}</span>;
  }
  return null;
}

function ChatListGroupBadges({ group }: { group: ChatListGroup }) {
  if (group.hasOfferBadge) {
    return <span className="chat-badge chat-badge--offer">!</span>;
  }
  if (group.totalUnread > 0) {
    return <span className="chat-badge chat-badge--count">{group.totalUnread}</span>;
  }
  return null;
}

function ChatListChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden
      className={`chats-list-group__chevron${expanded ? " is-expanded" : ""}`}
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ChatListItemProps = {
  item: ChatSummary;
  selectedId?: string | null;
  tabIndex?: number;
  showAvatarBadge?: boolean;
  onSelect: (item: ChatSummary) => void;
  href?: string;
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

function ChatListItem({
  item,
  selectedId,
  tabIndex,
  showAvatarBadge = false,
  onSelect,
  href,
  onNavigate,
}: ChatListItemProps) {
  const dealLine = getChatListDealLine(item);
  const preview = getChatListPreviewLine(item);
  const className = [
    "chats-list-item",
    "chats-list-item--main",
    dealLine ? "chats-list-item--has-deal" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {item.kind === "support" ? (
        <ChatListAvatar item={item} className="chats-list-item__avatar" />
      ) : (
        <ChatListDealMedia item={item} showAvatarBadge={showAvatarBadge} />
      )}
      <span className="chats-list-item__copy">
        <strong>
          <span
            className="chats-list-item__line-title"
            title={item.counterpart.displayName}
          >
            {truncateChatListLabel(item.counterpart.displayName, 24)}
          </span>
        </strong>
        {dealLine ? <ChatListDealLabel item={item} /> : null}
        <span className="chats-list-item__preview">{preview}</span>
      </span>
      <span className="chats-list-item__meta">
        <time>{formatChatListTime(item.updatedAt)}</time>
        <ChatListBadges item={item} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        tabIndex={tabIndex}
        className={className}
        data-kind={item.kind}
        data-active={selectedId === item.id ? "true" : undefined}
        onClick={(event) => onNavigate?.(href, event)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      data-kind={item.kind}
      data-active={selectedId === item.id ? "true" : undefined}
      onClick={() => onSelect(item)}
    >
      {content}
    </button>
  );
}

type ChatListGroupBlockProps = {
  group: ChatListGroup;
  expanded: boolean;
  selectedId?: string | null;
  tabIndex?: number;
  onToggle: (groupId: string) => void;
  onSelect: (item: ChatSummary) => void;
  getItemHref?: (item: ChatSummary) => string;
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

function ChatListGroupBlock({
  group,
  expanded,
  selectedId,
  tabIndex,
  onToggle,
  onSelect,
  getItemHref,
  onNavigate,
}: ChatListGroupBlockProps) {
  const countLabel = pluralRu(group.items.length, "обмен", "обмена", "обменов");
  const latest = group.latestItem;

  return (
    <div
      className={`chats-list-group${expanded ? " is-expanded" : ""}`}
      data-support={group.isSupport ? "true" : undefined}
    >
      <button
        type="button"
        className="chats-list-group__header chats-list-item chats-list-item--main"
        data-kind={latest.kind}
        data-active={
          !expanded && group.items.some((item) => item.id === selectedId)
            ? "true"
            : undefined
        }
        aria-expanded={expanded}
        onClick={() => onToggle(group.id)}
      >
        <ChatListAvatar item={latest} className="chats-list-item__avatar" />
        <span className="chats-list-item__copy">
          <strong>
            <span
              className="chats-list-item__line-title"
              title={group.counterpart.displayName}
            >
              {truncateChatListLabel(group.counterpart.displayName, 24)}
            </span>
            <span className="chats-list-group__count">
              {group.items.length} {countLabel}
            </span>
          </strong>
          <span className="chats-list-item__preview">{getChatListPreviewLine(latest)}</span>
        </span>
        <span className="chats-list-item__meta">
          <time>{formatChatListTime(latest.updatedAt)}</time>
          <span className="chats-list-group__meta-row">
            <ChatListGroupBadges group={group} />
            <ChatListChevron expanded={expanded} />
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="chats-list-group__threads">
          {group.items.map((item) => (
            <ChatListItem
              key={item.id}
              item={item}
              selectedId={selectedId}
              tabIndex={tabIndex}
              onSelect={onSelect}
              href={getItemHref?.(item)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type ChatListProps = {
  items: ChatSummary[];
  selectedId?: string | null;
  onSelect: (item: ChatSummary) => void;
  emptyLabel?: string;
  getItemHref?: (item: ChatSummary) => string;
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
  className?: string;
};

export function ChatList({
  items,
  selectedId,
  onSelect,
  emptyLabel = "В этой категории пока ничего нет.",
  getItemHref,
  onNavigate,
  tabIndex,
  className,
}: ChatListProps) {
  const groups = useMemo(() => groupChatSummaries(items), [items]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const activeGroup = findChatListGroup(groups, selectedId);
    if (!activeGroup || activeGroup.items.length < 2) return;
    setExpandedGroupIds((current) => {
      if (current.has(activeGroup.id)) return current;
      const next = new Set(current);
      next.add(activeGroup.id);
      return next;
    });
  }, [groups, selectedId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className={["chats-list", className].filter(Boolean).join(" ")}>
      {groups.map((group) =>
        group.items.length === 1 ? (
          <ChatListItem
            key={group.id}
            item={group.items[0]}
            showAvatarBadge
            selectedId={selectedId}
            tabIndex={tabIndex}
            onSelect={onSelect}
            href={getItemHref?.(group.items[0])}
            onNavigate={onNavigate}
          />
        ) : (
          <ChatListGroupBlock
            key={group.id}
            group={group}
            expanded={expandedGroupIds.has(group.id)}
            selectedId={selectedId}
            tabIndex={tabIndex}
            onToggle={toggleGroup}
            onSelect={onSelect}
            getItemHref={getItemHref}
            onNavigate={onNavigate}
          />
        ),
      )}
      {items.length === 0 ? <p className="chats-list__empty">{emptyLabel}</p> : null}
    </div>
  );
}
