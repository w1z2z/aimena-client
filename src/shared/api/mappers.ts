"use client";

import type { AuthUser } from "@/features/auth/types";
import type { HomeListingCard } from "@/features/home-search/types";

import type { BackendUserMe } from "./auth";
import type { ApiListingCard, ApiListingCondition } from "./listings";

const CONDITION_LABELS: Record<ApiListingCondition, string> = {
  excellent: "Отличное",
  new: "Новое",
  good: "Хорошее",
  used: "Б.у",
  needs_repair: "Требует ремонта",
  service: "Услуга",
};

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

function buildWantsPreview(listing: ApiListingCard): { wants: string[]; wantsMore: number } {
  const normalizedTextParts = listing.wantsText
    .split(/[,\n;]+/)
    .map((part) =>
      part
        .replace(/^хочу(?:\s+получить)?(?:\s+взамен)?\s*[:\-]?\s*/i, "")
        .replace(/^ищу\s*/i, "")
        .trim(),
    )
    .filter(Boolean);

  const candidates: string[] = [];

  // Business rule: explicit "wanted item" text always has top priority over category.
  if (normalizedTextParts.length > 0) {
    candidates.push(...normalizedTextParts);
  } else if (listing.wantsCategory?.name?.trim()) {
    candidates.push(listing.wantsCategory.name.trim());
  }

  const tags = listing.wantsTags
    .map((tag) => tag.trim())
    .filter(Boolean);
  candidates.push(...tags);

  const deduped = [...new Map(candidates.map((value) => [value.toLowerCase(), value])).values()];

  return {
    wants: deduped.slice(0, 2),
    wantsMore: Math.max(deduped.length - 2, 0),
  };
}

export function mapListingCardToHomeCard(listing: ApiListingCard): HomeListingCard {
  const wants = buildWantsPreview(listing);

  return {
    id: listing.id,
    title: listing.title,
    city: listing.city.name,
    condition: CONDITION_LABELS[listing.condition],
    wants: wants.wants,
    wantsMore: wants.wantsMore,
    hasDocuments: listing.hasDocuments,
    isFree: listing.isFree,
    price: listing.estimatedPrice ?? 0,
    coverImageUrl: listing.coverImageUrl,
  };
}
