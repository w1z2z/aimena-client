"use client";

import { httpRequest } from "./http";
import type { ApiListingCard, ApiListResponse } from "./listings";

type BackendProfile = {
  displayName: string;
  slug: string;
};

export type BackendAuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  profile: BackendProfile | null;
};

export type BackendAuthPayload = {
  accessToken: string;
  user: BackendAuthUser;
};

export type BackendUserMeProfile = {
  displayName: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  swapsCount: number;
  ratingAvg: number;
  ratingCount: number;
  city: { id: string; name: string; regionName: string | null; slug: string } | null;
  interests: Array<{ id: string; name: string; slug: string }>;
  onboardingCompleted: boolean;
  showCompletedListings: boolean;
  hidePersonalData: boolean;
};

export type UpdateMePayload = {
  displayName?: string;
  cityId?: string;
  bio?: string;
  showCompletedListings?: boolean;
  hidePersonalData?: boolean;
};

export type BackendUserMe = {
  id: string;
  email: string;
  status: "active" | "banned" | "deleted";
  emailVerified: boolean;
  createdAt: string;
  profile: BackendUserMeProfile | null;
};

type BackendUserMeResponse = {
  user: BackendUserMe;
};

export function registerUser(email: string, password: string) {
  return httpRequest<{ message: string }>("/auth/register", {
    method: "POST",
    body: { email, password },
    withCredentials: true,
  });
}

export function loginUser(email: string, password: string) {
  return httpRequest<BackendAuthPayload>("/auth/login", {
    method: "POST",
    body: { email, password },
    withCredentials: true,
  });
}

export function refreshSession(refreshToken?: string) {
  return httpRequest<BackendAuthPayload>("/auth/refresh", {
    method: "POST",
    body: refreshToken ? { refreshToken } : {},
    withCredentials: true,
  });
}

export function logoutUser(accessToken: string | null, refreshToken?: string) {
  return httpRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    token: accessToken,
    body: refreshToken ? { refreshToken } : {},
    withCredentials: true,
  });
}

export function forgotPassword(email: string) {
  return httpRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    withCredentials: true,
  });
}

export function resetPassword(token: string, password: string) {
  return httpRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
    withCredentials: true,
  });
}

export function verifyEmail(token: string) {
  return httpRequest<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: { token },
    withCredentials: true,
  });
}

export function resendVerification(email: string) {
  return httpRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
    withCredentials: true,
  });
}

export function getVerificationStatus(email: string) {
  return httpRequest<{ verified: boolean }>("/auth/verification-status", {
    method: "POST",
    body: { email },
    withCredentials: true,
  });
}

export const PENDING_VERIFY_EMAIL_KEY = "swaply-pending-verify-email";

export function rememberPendingVerifyEmail(email: string) {
  try {
    sessionStorage.setItem(PENDING_VERIFY_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    // Ignore storage failures (private mode / disabled storage).
  }
}

export function readPendingVerifyEmail(): string {
  try {
    return sessionStorage.getItem(PENDING_VERIFY_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearPendingVerifyEmail() {
  try {
    sessionStorage.removeItem(PENDING_VERIFY_EMAIL_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function getCurrentUser(accessToken: string) {
  return httpRequest<BackendUserMeResponse>("/users/me", {
    method: "GET",
    token: accessToken,
  });
}

export function updateOnboarding(
  accessToken: string,
  payload: { cityId: string; interestCategoryIds: string[] },
) {
  return httpRequest<BackendUserMeResponse>("/users/me/onboarding", {
    method: "PATCH",
    token: accessToken,
    body: payload,
  });
}

export function updateMe(accessToken: string, payload: UpdateMePayload) {
  return httpRequest<BackendUserMeResponse>("/users/me", {
    method: "PATCH",
    token: accessToken,
    body: payload,
  });
}

export function uploadAvatar(accessToken: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return httpRequest<BackendUserMeResponse>("/users/me/avatar", {
    method: "POST",
    token: accessToken,
    body: formData,
  });
}

export function deleteAvatar(accessToken: string) {
  return httpRequest<BackendUserMeResponse>("/users/me/avatar", {
    method: "DELETE",
    token: accessToken,
  });
}

export type BackendPublicProfile = {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  swapsCount: number;
  ratingAvg: number;
  ratingCount: number;
  city: {
    id: string;
    name: string;
    regionName: string | null;
    slug: string;
    displayName?: string;
  } | null;
  joinedAt: string;
  showCompletedListings: boolean;
};

type BackendPublicProfileResponse = {
  profile: BackendPublicProfile;
};

export function getPublicProfile(slug: string, signal?: AbortSignal) {
  return httpRequest<BackendPublicProfileResponse>(`/users/${slug}`, {
    method: "GET",
    signal,
  });
}

export function getUserListingsBySlug(
  slug: string,
  query: {
    page?: number;
    pageSize?: number;
    status?: ApiListingCard["status"][];
    sort?: "newest" | "oldest";
  } = {},
  signal?: AbortSignal,
) {
  return httpRequest<ApiListResponse<ApiListingCard>>(`/users/${slug}/listings`, {
    query,
    signal,
  });
}
