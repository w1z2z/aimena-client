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
