"use client";

import { httpRequest } from "./http";

export type MediaPresignPayload = {
  purpose: "listing";
  contentType: string;
  size: number;
};

export type MediaPresignResponse = {
  uploadId: string;
  purpose: "listing";
  uploadUrl: string;
  expiresIn: number;
  key: string;
  publicUrl: string;
};

export type MediaConfirmResponse = {
  uploadId: string;
  purpose: "listing";
  status: "pending" | "ready" | "failed";
  publicUrl: string;
};

export type UploadListingViaBackendResponse = {
  uploadId: string;
  purpose: "listing";
  status: "ready";
  publicUrl: string;
};

export function createMediaPresign(payload: MediaPresignPayload) {
  return httpRequest<MediaPresignResponse>("/media/presign", {
    method: "POST",
    body: payload,
  });
}

export function confirmMediaUpload(uploadId: string) {
  return httpRequest<MediaConfirmResponse>(`/media/${uploadId}/confirm`, {
    method: "POST",
  });
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

export function uploadListingFileViaBackend(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return httpRequest<UploadListingViaBackendResponse>("/media/listing/upload", {
    method: "POST",
    body: formData,
  });
}
