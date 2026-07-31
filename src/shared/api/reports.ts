"use client";

import { httpRequest } from "./http";

export type ReportTargetType = "listing" | "user";

export type ReportReason =
  | "wrong_info"
  | "prohibited"
  | "fraud"
  | "spam"
  | "already_gone"
  | "wrong_category"
  | "abuse"
  | "no_show"
  | "fake"
  | "impersonation"
  | "other";

export type ReportStatus = "open" | "reviewed" | "resolved" | "dismissed";

export type CreateReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  comment?: string;
};

export type ReportResponse = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  createdAt: string;
};

export function createReport(payload: CreateReportPayload) {
  return httpRequest<ReportResponse>("/reports", {
    method: "POST",
    body: payload,
  });
}
