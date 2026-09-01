import type { ChatSummary } from "@/shared/api/chats";

export function notificationHasUnread(item: ChatSummary) {
  if (item.notificationKind === "offer_rejected") return false;
  if (item.notificationKind === "offer_accepted") return false;
  if (item.notificationKind === "both_ready") return false;
  if (item.kind === "offer" && item.status === "incoming_request") return true;
  if (
    item.notificationKind === "cancel_requested" ||
    item.notificationKind === "cancel_rejected" ||
    item.notificationKind === "deal_aborted" ||
    item.notificationKind === "deal_cancelled" ||
    item.notificationKind === "deal_not_completed" ||
    item.notificationKind === "partner_ready" ||
    item.notificationKind === "complete_requested" ||
    item.notificationKind === "failure_requested" ||
    item.notificationKind === "review_needed"
  ) {
    return item.unreadCount > 0;
  }
  return false;
}

export function computeHasUnreadNotifications(items: ChatSummary[]) {
  return items.some(notificationHasUnread);
}

export function conversationHasUnread(item: ChatSummary) {
  return item.unreadCount > 0;
}

export function computeHasUnreadConversations(items: ChatSummary[]) {
  return items.some(conversationHasUnread);
}

export function chatSummaryToHref(item: ChatSummary) {
  const selected = item.threadId ?? item.id;
  const params = new URLSearchParams({ selected });
  if (item.notificationKind === "cancel_requested") {
    params.set("dealModal", "cancel_request");
  } else if (item.notificationKind === "failure_requested") {
    params.set("dealModal", "failure_request");
  } else if (item.notificationKind === "review_needed") {
    params.set("dealModal", "review");
  }
  return `/chats?${params.toString()}`;
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
    item.kind === "chat" &&
      (item.preview.includes("Предложение принято") ||
        item.preview.includes("Свяжитесь с владельцем") ||
        item.preview.includes("Можно связаться в чате")),
  );
}

/** Заголовок = статус события, не имя человека и не название товара. */
export function getNotificationTitle(item: ChatSummary) {
  if (isOfferAcceptedItem(item)) {
    return "Предложение принято!";
  }

  switch (item.notificationKind) {
    case "incoming_offer":
      return "Вам предложили обмен";
    case "offer_accepted":
      return "Предложение принято!";
    case "offer_rejected":
      return "Ваше предложение отклонено";
    case "cancel_requested":
      return "Запрос на обоюдный отказ";
    case "cancel_rejected":
      return "Обоюдный отказ отклонён";
    case "deal_aborted":
      return "Сделка отменена";
    case "deal_cancelled":
      return "Обоюдный отказ от обмена";
    case "deal_not_completed":
      return "Обмен не состоялся";
    case "partner_ready":
      return "Партнёр готов к обмену";
    case "both_ready":
      return "Оба готовы к обмену";
    case "complete_requested":
      return "Обмен состоялся?";
    case "failure_requested":
      return "Обмен не состоялся?";
    case "review_needed":
      return "Оставьте отзыв";
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

/**
 * Под заголовком:
 * - оффер / отклонение → пилюли (через getNotificationTags), subtitle не нужен
 * - принято → короткий CTA
 * - сообщение → превью текста
 */
export function getNotificationSubtitle(item: ChatSummary) {
  if (isOfferAcceptedItem(item)) {
    // У владельца (recipient) показываем пилюли offered — subtitle не дублируем.
    if (item.isOfferSender === false && item.tags && item.tags.length > 0) {
      return undefined;
    }
    return item.isOfferSender === false
      ? "Можно связаться в чате"
      : "Свяжитесь с владельцем";
  }

  switch (item.notificationKind) {
    case "incoming_offer":
      return item.tags && item.tags.length > 0 ? undefined : "Откройте, чтобы рассмотреть";
    case "offer_accepted":
      if (item.isOfferSender === false && item.tags && item.tags.length > 0) {
        return undefined;
      }
      return item.isOfferSender === false
        ? "Можно связаться в чате"
        : "Свяжитесь с владельцем";
    case "offer_rejected":
      return item.tags && item.tags.length > 0 ? undefined : undefined;
    case "cancel_requested":
      return "Участник запрашивает обоюдный отказ от обмена";
    case "cancel_rejected":
      return "Партнёр отклонил запрос на обоюдный отказ";
    case "deal_aborted":
      return "Партнёр отменил обмен";
    case "deal_cancelled":
      return "Сделка отменена по обоюдному согласию";
    case "deal_not_completed":
      return "Сделка закрыта: обмен не состоялся";
    case "partner_ready":
      return "Подтвердите готовность в чате";
    case "both_ready":
      return "Можно встречаться и завершать обмен";
    case "complete_requested":
      return "Подтвердите, что обмен состоялся";
    case "failure_requested":
      return "Партнёр сообщил, что обмен не состоялся";
    case "review_needed":
      return "Оставьте отзыв о проведённом обмене";
    case "support":
    case "chat_message":
      return item.preview;
    default:
      if (item.kind === "offer") {
        return item.tags && item.tags.length > 0 ? undefined : "Откройте, чтобы рассмотреть";
      }
      return item.preview;
  }
}

export function getNotificationTags(item: ChatSummary) {
  if (item.notificationKind === "incoming_offer" && item.tags?.length) {
    return item.tags;
  }
  // Владелец после принятия: пилюли того, что ему предложили (offered).
  if (
    (item.notificationKind === "offer_accepted" || isOfferAcceptedItem(item)) &&
    item.isOfferSender === false &&
    item.tags?.length
  ) {
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

export function formatChatListTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return "Вчера";
}

export function formatOfferedListLabel(titles: string[]) {
  const normalized = titles.map((title) => title.trim()).filter(Boolean);
  if (normalized.length === 0) return "";
  if (normalized.length === 1) return normalized[0];
  return `${normalized[0]} + ещё ${normalized.length - 1}`;
}

export function truncateChatListLabel(text: string, maxLength = 30) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getOfferedListParts(titles: string[]) {
  const normalized = titles.map((title) => title.trim()).filter(Boolean);
  if (normalized.length === 0) {
    return { label: "", primaryLabel: "", extraLabel: undefined as string | undefined };
  }
  if (normalized.length === 1) {
    return {
      label: normalized[0],
      primaryLabel: normalized[0],
      extraLabel: undefined,
    };
  }

  const extraLabel = `+ ещё ${normalized.length - 1}`;
  return {
    label: `${normalized[0]} ${extraLabel}`,
    primaryLabel: normalized[0],
    extraLabel,
  };
}

function getOfferedTitles(item: ChatSummary) {
  if (item.tags?.length) {
    return item.tags.map((title) => title.trim()).filter(Boolean);
  }
  if (item.offeredListingTitle?.trim()) {
    return [item.offeredListingTitle.trim()];
  }
  return [];
}

function getOfferedCoverUrls(item: ChatSummary) {
  if (item.offeredListingCoverUrls?.length) {
    return item.offeredListingCoverUrls;
  }
  if (item.offeredListingCoverUrl) {
    return [item.offeredListingCoverUrl];
  }
  return [];
}

/** True when the current viewer sent the exchange offer. */
export function isViewerOfferSender(item: ChatSummary) {
  if (item.isOfferSender === true) return true;
  if (item.isOfferSender === false) return false;
  if (item.kind === "offer" && item.notificationKind !== "offer_rejected") {
    return false;
  }
  if (item.notificationKind === "offer_rejected") return true;
  return false;
}

export type ChatListDealLine = {
  label: string;
  primaryLabel: string;
  extraLabel?: string;
  coverUrl: string | null;
  thumbTitle: string;
};

/**
 * One contextual line for the deal in the chat list:
 * - sender → target listing (what they want)
 * - recipient → offered listings (what is proposed to them)
 */
export function getChatListDealLine(item: ChatSummary): ChatListDealLine | null {
  if (item.kind === "support") return null;

  const targetTitle = item.targetListingTitle?.trim() || null;
  const offeredTitles = getOfferedTitles(item);
  const sender = isViewerOfferSender(item);

  if (sender) {
    if (!targetTitle) return null;
    return {
      label: targetTitle,
      primaryLabel: targetTitle,
      coverUrl: item.targetListingCoverUrl ?? null,
      thumbTitle: targetTitle,
    };
  }

  if (offeredTitles.length > 0) {
    const coverUrls = getOfferedCoverUrls(item);
    const parts = getOfferedListParts(offeredTitles);
    return {
      label: parts.label,
      primaryLabel: parts.primaryLabel,
      extraLabel: parts.extraLabel,
      coverUrl: coverUrls[0] ?? null,
      thumbTitle: offeredTitles[0],
    };
  }

  if (targetTitle) {
    return {
      label: targetTitle,
      primaryLabel: targetTitle,
      coverUrl: item.targetListingCoverUrl ?? null,
      thumbTitle: targetTitle,
    };
  }

  return null;
}

/** Listing cover for chat list: what the viewer receives in the exchange. */
export function getChatListThumb(item: ChatSummary): {
  coverUrl: string | null;
  thumbTitle: string;
} | null {
  if (item.kind === "support") return null;

  const dealLine = getChatListDealLine(item);
  if (dealLine) {
    return {
      coverUrl: dealLine.coverUrl,
      thumbTitle: dealLine.thumbTitle,
    };
  }

  const coverUrl =
    item.coverImageUrl ??
    item.offeredListingCoverUrl ??
    item.targetListingCoverUrl ??
    null;
  const thumbTitle =
    item.offeredListingTitle?.trim() ||
    item.targetListingTitle?.trim() ||
    item.tags?.[0]?.trim() ||
    item.counterpart.displayName;

  return { coverUrl, thumbTitle };
}

export function getChatListContextLine(item: ChatSummary) {
  const dealLine = getChatListDealLine(item);
  if (dealLine) return dealLine.label;
  if (item.targetListingTitle?.trim()) return item.targetListingTitle.trim();
  if (item.tags?.[0]?.trim()) return item.tags[0].trim();
  return null;
}

export type ChatExchangeDisplay = {
  targetTitle: string;
  offeredTitle: string | null;
  targetCover: string | null;
  offeredCover: string | null;
  line: string;
};

/** Always target listing ⇄ offered listing — same order as in the deal. */
export function getChatExchangeDisplay(item: ChatSummary): ChatExchangeDisplay | null {
  if (item.kind === "support") return null;

  const targetTitle = item.targetListingTitle?.trim() || null;
  const offeredTitle =
    item.offeredListingTitle?.trim() || item.tags?.[0]?.trim() || null;
  const targetCover = item.targetListingCoverUrl ?? null;
  const offeredCover = item.offeredListingCoverUrl ?? null;

  if (!targetTitle && !offeredTitle) return null;

  const resolvedTarget = targetTitle ?? offeredTitle!;
  const resolvedOffered = targetTitle ? offeredTitle : null;
  const line = resolvedOffered
    ? `${resolvedTarget} ⇄ ${resolvedOffered}`
    : resolvedTarget;

  return {
    targetTitle: resolvedTarget,
    offeredTitle: resolvedOffered,
    targetCover,
    offeredCover,
    line,
  };
}

export function getChatListPreviewLine(item: ChatSummary) {
  if (item.notificationKind === "offer_rejected") return "Предложение отклонено";
  if (item.kind === "offer") return "Вам предложение!";
  return item.preview;
}

export function getChatListSubtitle(item: ChatSummary) {
  return getChatListPreviewLine(item);
}

