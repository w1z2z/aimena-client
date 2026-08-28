"use client";

import { httpRequest } from "./http";
import type { DealView } from "./deals";
import type {
  ApiListingCondition,
  ApiListingServiceFormat,
  ApiListingServiceWorkLevel,
} from "./listings";

export type ChatProfile = {
  id: string;
  displayName: string;
  slug: string;
  swapsCount: number;
  ratingAvg: number;
  avatarUrl: string | null;
};

export type ChatListing = {
  id: string;
  ownerId: string;
  type: "item" | "service";
  title: string;
  condition: ApiListingCondition | null;
  serviceWorkLevel: ApiListingServiceWorkLevel | null;
  serviceFormats: ApiListingServiceFormat[];
  estimatedPrice: number | null;
  extraPay: "none" | "i_pay" | "they_pay" | "both";
  isFree?: boolean;
  hasDocuments: boolean;
  wantsTags: string[];
  wantsCategories: Array<{ id: string; name: string; slug: string }>;
  category: { id: string; name: string; slug: string };
  city: { id: string; name: string; slug: string };
  coverImageUrl: string | null;
};

export type NotificationKind =
  | "incoming_offer"
  | "offer_accepted"
  | "offer_rejected"
  | "chat_message"
  | "support"
  | "cancel_requested"
  | "cancel_rejected"
  | "deal_aborted"
  | "deal_cancelled"
  | "deal_not_completed"
  | "partner_ready"
  | "both_ready"
  | "complete_requested"
  | "failure_requested"
  | "review_needed";

export type ChatSummary = {
  id: string;
  kind: "offer" | "chat" | "support";
  notificationKind?: NotificationKind;
  offerId: string;
  threadId: string | null;
  targetListingId?: string | null;
  targetListingTitle?: string | null;
  isOfferSender?: boolean;
  status:
    | "incoming_request"
    | "active"
    | "read_only_cancelled"
    | "read_only_reviewed";
  counterpart: ChatProfile;
  preview: string;
  tags?: string[];
  coverImageUrl?: string | null;
  imageFallback?: string | null;
  updatedAt: string;
  unreadCount: number;
};

export type IncomingOffer = {
  id: string;
  status: "pending" | "rejected";
  message: string;
  createdAt: string;
  viewerRole?: "sender" | "recipient";
  sender: ChatProfile;
  recipient?: ChatProfile;
  targetListing: ChatListing;
  offeredListings: ChatListing[];
};

export type ChatMessageAttachment = {
  id: string;
  kind: "image" | "file";
  fileName: string;
  mime: string;
  url: string;
  thumbUrl: string;
  fullUrl: string;
  sourceListingId: string | null;
  size?: number;
};

export type ChatMessage = {
  id: string;
  senderId: string | null;
  type: "text" | "system" | "attachment";
  body: string;
  createdAt: string;
  attachments?: ChatMessageAttachment[];
};

export type AttachableListingDocuments = {
  listingId: string;
  title: string;
  documents: Array<{
    listingImageId: string;
    fileName: string;
    mime: string;
    url: string;
    thumbUrl: string;
    fullUrl: string;
  }>;
};

export type ChatThread = {
  id: string;
  kind: "chat" | "support";
  status: "active" | "read_only_cancelled" | "read_only_reviewed";
  counterpart: ChatProfile;
  counterpartLastReadAt?: string | null;
  offer: {
    id: string;
    senderId: string;
    message: string;
    targetListing: ChatListing;
    offeredListings: ChatListing[];
  } | null;
  deal: DealView | null;
  messages: ChatMessage[];
};

export function getChats(signal?: AbortSignal) {
  return httpRequest<{ data: ChatSummary[] }>("/chats", { signal });
}

export function getChatConversations(options?: {
  limit?: number;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  const path = query ? `/chats/conversations?${query}` : "/chats/conversations";

  return httpRequest<{ data: ChatSummary[] }>(path, { signal: options?.signal });
}

export function getChatInboxStatus(signal?: AbortSignal) {
  return httpRequest<{
    hasUnreadNotifications: boolean;
    hasUnreadConversations: boolean;
  }>("/chats/inbox-status", { signal });
}

export function getChatNotifications(options?: {
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams();
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  const path = query ? `/chats/notifications?${query}` : "/chats/notifications";

  return httpRequest<{
    data: ChatSummary[];
    nextCursor: string | null;
    hasMore: boolean;
  }>(path, { signal: options?.signal });
}

export function openSupportChat() {
  return httpRequest<{ thread: ChatThread }>("/chats/support", {
    method: "POST",
  });
}

export function getIncomingOffer(offerId: string, signal?: AbortSignal) {
  return httpRequest<{ offer: IncomingOffer }>(`/chats/offers/${offerId}`, {
    signal,
  });
}

export function getChatThread(threadId: string, signal?: AbortSignal) {
  return httpRequest<{ thread: ChatThread }>(`/chats/${threadId}`, { signal });
}

export function getChatAttachableDocuments(threadId: string, signal?: AbortSignal) {
  return httpRequest<{ listings: AttachableListingDocuments[] }>(
    `/chats/${threadId}/attachable-documents`,
    { signal },
  );
}

export function sendChatMessage(
  threadId: string,
  payload: {
    body?: string;
    chatUploadIds?: string[];
    chatFileNames?: string[];
    listingDocumentIds?: string[];
  },
) {
  return httpRequest<{ message: ChatMessage }>(`/chats/${threadId}/messages`, {
    method: "POST",
    body: payload,
  });
}
