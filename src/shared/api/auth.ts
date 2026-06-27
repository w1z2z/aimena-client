"use client";

import { httpRequest } from "./http";

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
  avatarUrl: string | null;
  verified: boolean;
  city: { id: string; name: string; regionName: string | null; slug: string } | null;
  interests: Array<{ id: string; name: string; slug: string }>;
  onboardingCompleted: boolean;
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
