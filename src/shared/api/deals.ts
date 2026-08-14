"use client";

import { httpRequest } from "./http";

export type CreateExchangeOfferPayload = {
  targetListingId: string;
  offeredListingIds: string[];
  message: string;
};

export type ExchangeOfferResponse = {
  offer: {
    id: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    targetListingId: string;
    offeredListingIds: string[];
    message: string;
    createdAt: string;
  };
};

export function createExchangeOffer(payload: CreateExchangeOfferPayload) {
  return httpRequest<ExchangeOfferResponse>("/deals/exchange-offers", {
    method: "POST",
    body: payload,
  });
}

export type ResolveExchangeOfferResponse = {
  offerId: string;
  status: "accepted" | "rejected";
  threadId?: string;
};

export function acceptExchangeOffer(offerId: string) {
  return httpRequest<ResolveExchangeOfferResponse>(
    `/deals/exchange-offers/${offerId}/accept`,
    { method: "POST" },
  );
}

export function rejectExchangeOffer(offerId: string) {
  return httpRequest<ResolveExchangeOfferResponse>(
    `/deals/exchange-offers/${offerId}/reject`,
    { method: "POST" },
  );
}

export type DealStatus =
  | "negotiating"
  | "confirmation_pending"
  | "agreed"
  | "cancellation_pending"
  | "cancelled"
  | "completion_pending"
  | "awaiting_reviews"
  | "partially_reviewed"
  | "reviewed";

export type DealView = {
  id: string;
  offerId: string;
  threadId: string | null;
  status: DealStatus;
  cancelKind: "none" | "mutual" | "abort";
  iAmSender: boolean;
  termsConfirmedByMe: boolean;
  termsConfirmedByOther: boolean;
  completedByMe: boolean;
  completedByOther: boolean;
  cancellationRequestedByMe: boolean;
  myReviewId: string | null;
  canConfirmTerms: boolean;
  canUnconfirmTerms: boolean;
  canComplete: boolean;
  canAbort: boolean;
  canRequestCancel: boolean;
  canAcceptCancel: boolean;
  canRejectCancel: boolean;
  canReview: boolean;
};

export type DealActionResponse = {
  deal: DealView;
  action: string;
};

export function confirmDealTerms(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/confirm-terms`, {
    method: "POST",
  });
}

export function unconfirmDealTerms(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/unconfirm-terms`, {
    method: "POST",
  });
}

export function requestDealCancel(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/request-cancel`, {
    method: "POST",
  });
}

export function acceptDealCancel(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/accept-cancel`, {
    method: "POST",
  });
}

export function rejectDealCancel(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/reject-cancel`, {
    method: "POST",
  });
}

export function abortDeal(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/abort`, {
    method: "POST",
  });
}

export function completeDeal(dealId: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/complete`, {
    method: "POST",
  });
}

export function createDealReview(dealId: string, body: string) {
  return httpRequest<DealActionResponse>(`/deals/${dealId}/reviews`, {
    method: "POST",
    body: { body },
  });
}

export type DealHistoryStatus = "successful" | "cancelled";

export type DealHistoryPerson = {
  id: string;
  slug: string | null;
  name: string;
  avatarUrl: string | null;
  avatarInitial: string;
  points: number;
};

export type DealHistoryListingSide = {
  title: string;
  imageUrl: string | null;
  secondaryImageUrl: string | null;
  listingsCount: number;
};

export type DealHistoryItem = {
  id: string;
  threadId: string | null;
  status: DealHistoryStatus;
  date: string;
  given: DealHistoryListingSide;
  received: DealHistoryListingSide;
  partner: DealHistoryPerson;
  canLeaveReview: boolean;
  highlighted: boolean;
};

export type DealReviewItem = {
  id: string;
  text: string;
  date: string;
  author: DealHistoryPerson;
};

export type DealListMeta = {
  total: number;
  page: number | null;
  pageSize: number | null;
  pageCount: number | null;
};

export type DealHistoryQuery = {
  status?: "all" | DealHistoryStatus;
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
};

export type DealReviewsQuery = {
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
};

export function getMyDealHistory(query: DealHistoryQuery = {}, signal?: AbortSignal) {
  return httpRequest<{ data: DealHistoryItem[]; meta: DealListMeta }>("/deals/history", {
    query,
    signal,
  });
}

export function getMyDealReviews(query: DealReviewsQuery = {}, signal?: AbortSignal) {
  return httpRequest<{ data: DealReviewItem[]; meta: DealListMeta }>("/deals/reviews", {
    query,
    signal,
  });
}

export function getUserDealHistory(
  slug: string,
  query: DealHistoryQuery = {},
  signal?: AbortSignal,
) {
  return httpRequest<{ data: DealHistoryItem[]; meta: DealListMeta }>(
    `/users/${slug}/deals`,
    { query, signal },
  );
}

export function getUserDealReviews(
  slug: string,
  query: DealReviewsQuery = {},
  signal?: AbortSignal,
) {
  return httpRequest<{ data: DealReviewItem[]; meta: DealListMeta }>(
    `/users/${slug}/reviews`,
    { query, signal },
  );
}
