"use client";

import { httpRequest } from "./http";

export type UploadListingViaBackendResponse = {
  uploadId: string;
  purpose: "listing";
  status: "ready";
  publicUrl: string;
  thumbUrl: string;
  fullUrl: string;
  mime: string;
};

export type ListingUploadRole = "item" | "document";

export function uploadListingFileViaBackend(
  file: File,
  role: ListingUploadRole = "item",
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("role", role);
  return httpRequest<UploadListingViaBackendResponse>("/media/listing/upload", {
    method: "POST",
    body: formData,
  });
}
