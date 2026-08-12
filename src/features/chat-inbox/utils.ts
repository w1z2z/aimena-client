import type { ChatSummary } from "@/shared/api/chats";

export function chatSummaryHasUnread(item: ChatSummary) {
  if (item.notificationKind === "offer_rejected") return false;
  return item.kind === "offer" || item.unreadCount > 0;
}

export function computeHasUnread(items: ChatSummary[]) {
  return items.some(chatSummaryHasUnread);
}

export function chatSummaryToHref(item: ChatSummary) {
  if (item.notificationKind === "offer_rejected" && item.targetListingId) {
    return `/listings/${item.targetListingId}`;
  }
  return `/chats?selected=${encodeURIComponent(item.id)}`;
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return "Сегодня";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Вчера";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function isOfferAcceptedItem(item: ChatSummary) {
  if (item.notificationKind === "offer_accepted") return true;
  return Boolean(
    item.targetListingTitle &&
      item.preview.includes("Предложение принято") &&
      item.kind === "chat",
  );
}

export function getNotificationTitle(item: ChatSummary) {
  if (isOfferAcceptedItem(item)) {
    return item.targetListingTitle ?? "Предложение принято!";
  }

  switch (item.notificationKind) {
    case "incoming_offer":
      return "Вам предложили обмен";
    case "offer_accepted":
      return item.targetListingTitle ?? item.tags?.[0] ?? "Предложение принято!";
    case "offer_rejected":
      return "Ваше предложение отклонено";
    case "support":
      return "Сообщение от поддержки";
    case "chat_message":
      return item.counterpart.displayName;
    default:
      if (item.kind === "offer") return "Вам предложили обмен";
      if (item.kind === "support") return "Сообщение от поддержки";
      return item.counterpart.displayName;
  }
}

export function getNotificationSubtitle(item: ChatSummary) {
  if (isOfferAcceptedItem(item)) {
    return item.preview.includes("Свяжитесь")
      ? "Свяжитесь с владельцем"
      : "Предложение принято!";
  }

  switch (item.notificationKind) {
    case "incoming_offer":
      return item.tags && item.tags.length > 0 ? undefined : item.preview;
    case "offer_accepted":
      return "Свяжитесь с владельцем";
    case "offer_rejected":
      return undefined;
    case "support":
    case "chat_message":
      return item.preview;
    default:
      if (item.kind === "offer") {
        return item.tags && item.tags.length > 0 ? undefined : item.preview;
      }
      return item.preview;
  }
}

export function getNotificationTags(item: ChatSummary) {
  if (item.notificationKind === "incoming_offer" && item.tags?.length) {
    return item.tags;
  }
  if (item.notificationKind === "offer_rejected" && item.tags?.length) {
    return item.tags;
  }
  if (item.kind === "offer" && item.tags?.length && !item.notificationKind) {
    return item.tags;
  }
  return undefined;
}

export function getNotificationImageUrl(item: ChatSummary) {
  if (item.notificationKind === "support" || item.kind === "support") {
    return null;
  }
  return item.coverImageUrl ?? item.counterpart.avatarUrl ?? null;
}

export function getNotificationImageFallback(item: ChatSummary) {
  if (item.notificationKind === "support" || item.kind === "support") {
    return null;
  }
  return item.imageFallback ?? item.counterpart.displayName.slice(0, 1).toUpperCase();
}

export function notificationHasUnread(item: ChatSummary) {
  if (item.notificationKind === "offer_rejected") return false;
  return item.kind === "offer" || item.unreadCount > 0;
}
