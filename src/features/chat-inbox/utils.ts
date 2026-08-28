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

