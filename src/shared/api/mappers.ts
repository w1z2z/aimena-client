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
  const cityId = user.profile?.city?.id ?? null;
  const city = user.profile?.city?.name ?? null;
  const favoriteCategories = user.profile?.interests.map((interest) => interest.name) ?? [];

  return {
    id: user.id,
    name: displayName,
    email: user.email,
    avatarInitial: getAvatarInitial(displayName, user.email),
    avatarUrl: user.profile?.avatarUrl ?? null,
    onboardingCompleted: user.profile?.onboardingCompleted ?? false,
    favoriteCategories,
    cityId,
    city,
    slug: user.profile?.slug ?? null,
    bio: user.profile?.bio ?? null,
    verified: user.profile?.verified ?? false,
    swapsCount: user.profile?.swapsCount ?? 0,
    ratingAvg: user.profile?.ratingAvg ?? 0,
    ratingCount: user.profile?.ratingCount ?? 0,
    createdAt: user.createdAt ?? null,
    showCompletedListings: user.profile?.showCompletedListings ?? true,
    hidePersonalData: user.profile?.hidePersonalData ?? true,
  };
}
