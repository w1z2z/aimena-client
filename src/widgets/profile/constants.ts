export const PROFILE_ASSETS = {
  verified: "/profile/icon-verified.svg",
  pin: "/profile/icon-pin.svg",
  bolt: "/profile/icon-bolt.svg",
  pointsBolt: "/profile/icon-points-bolt.svg",
  upload: "/profile/icon-upload.svg",
  settings: "/profile/icon-settings.svg",
  listings: "/profile/icon-listings.svg",
  deals: "/profile/icon-deals.svg",
  reviews: "/profile/icon-reviews.svg",
  gallery: "/profile/icon-gallery.svg",
  swap: "/profile/icon-swap.svg",
  swapAlt: "/profile/icon-swap-alt.svg",
} as const;

export type ProfileSection = "listings" | "deals" | "reviews" | "settings";

export type PublicProfileSection = "listings" | "deals" | "reviews";

export const PROFILE_NAV: Array<{
  id: ProfileSection;
  href: string;
  label: string;
  icon: keyof typeof PROFILE_ASSETS;
}> = [
  { id: "settings", href: "/profile/settings", label: "Настройки профиля", icon: "settings" },
  { id: "listings", href: "/profile", label: "Ваши объявления", icon: "listings" },
  { id: "deals", href: "/profile/deals", label: "История обменов", icon: "deals" },
  { id: "reviews", href: "/profile/reviews", label: "Ваши отзывы", icon: "reviews" },
];

export function getPublicProfileNav(slug: string): Array<{
  id: PublicProfileSection;
  href: string;
  label: string;
  icon: keyof typeof PROFILE_ASSETS;
  /** Shown in tab bar only up to compact breakpoint (mobile chrome). */
  compactOnly?: boolean;
}> {
  return [
    { id: "listings", href: `/users/${slug}`, label: "Объявления", icon: "listings" },
    { id: "deals", href: `/users/${slug}/deals`, label: "История обменов", icon: "deals" },
    {
      id: "reviews",
      href: `/users/${slug}/reviews`,
      label: "Отзывы",
      icon: "reviews",
      compactOnly: true,
    },
  ];
}

export function formatProfileDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU");
}

export function formatJoinedMonth(createdAt: string | null | undefined) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}.${year}`;
}

export function formatProfileNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatRatingPoints(value: number) {
  return formatProfileNumber(Math.max(0, Math.round(value)));
}

export function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
