"use client";

import { httpRequest } from "./http";
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
  hasDocuments: boolean;
  wantsTags: string[];
  wantsCategories: Array<{ id: string; name: string; slug: string }>;
  category: { id: string; name: string; slug: string };
  city: { id: string; name: string; slug: string };
  coverImageUrl: string | null;
};

export type ChatSummary = {
  id: string;
  kind: "offer" | "chat";
  offerId: string;
  threadId: string | null;
  status:
    | "incoming_request"
    | "active"
    | "read_only_cancelled"
    | "read_only_reviewed";
  counterpart: ChatProfile;
  preview: string;
  updatedAt: string;
  unreadCount: number;
};

export type IncomingOffer = {
  id: string;
  status: "pending";
  message: string;
  createdAt: string;
  sender: ChatProfile;
  targetListing: ChatListing;
  offeredListings: ChatListing[];
};

export type ChatMessage = {
  id: string;
  senderId: string | null;
  type: "text" | "system";
  body: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  status: "active" | "read_only_cancelled" | "read_only_reviewed";
  counterpart: ChatProfile;
  offer: {
    id: string;
    senderId: string;
    message: string;
    targetListing: ChatListing;
    offeredListings: ChatListing[];
  };
  messages: ChatMessage[];
};

export function getChats(signal?: AbortSignal) {
  return httpRequest<{ data: ChatSummary[] }>("/chats", { signal });
}

export function getIncomingOffer(offerId: string, signal?: AbortSignal) {
  return httpRequest<{ offer: IncomingOffer }>(`/chats/offers/${offerId}`, {
    signal,
  });
}

export function getChatThread(threadId: string, signal?: AbortSignal) {
  return httpRequest<{ thread: ChatThread }>(`/chats/${threadId}`, { signal });
}

export function sendChatMessage(threadId: string, body: string) {
  return httpRequest<{ message: ChatMessage }>(`/chats/${threadId}/messages`, {
    method: "POST",
    body: { body },
  });
}
