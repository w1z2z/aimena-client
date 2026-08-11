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
