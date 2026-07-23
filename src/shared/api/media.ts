"use client";

import { httpRequest } from "./http";

export type UploadListingViaBackendResponse = {
  uploadId: string;
  purpose: "listing";
  status: "ready";
  publicUrl: string;
};

export function uploadListingFileViaBackend(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return httpRequest<UploadListingViaBackendResponse>("/media/listing/upload", {
    method: "POST",
    body: formData,
  });
}
