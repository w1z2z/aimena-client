"use client";

import type { AuthUser } from "@/features/auth/types";

import type { BackendUserMe } from "./auth";

function getAvatarInitial(name: string, email: string): string {
  const normalizedName = name.trim();
  if (normalizedName) {
    return normalizedName.charAt(0).toUpperCase();
  }
  const localPart = email.split("@")[0]?.trim() ?? "";
  return localPart.charAt(0).toUpperCase() || "U";
}

export function mapBackendUserToAuthUser(user: BackendUserMe): AuthUser {
  const displayName = user.profile?.displayName ?? user.email.split("@")[0] ?? "Пользователь";
  const city = user.profile?.city?.name ?? null;
  const favoriteCategories = user.profile?.interests.map((interest) => interest.name) ?? [];

  return {
    id: user.id,
    name: displayName,
    email: user.email,
    avatarInitial: getAvatarInitial(displayName, user.email),
    onboardingCompleted: user.profile?.onboardingCompleted ?? false,
    favoriteCategories,
    city,
  };
}

export { mapApiListingToCard as mapListingCardToHomeCard } from "@/entities/listing";
