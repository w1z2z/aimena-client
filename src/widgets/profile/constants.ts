export const PROFILE_ASSETS = {
  verified: "/profile/icon-verified.svg",
  pin: "/profile/icon-pin.svg",
  bolt: "/profile/icon-bolt.svg",
  chocolate: "/profile/icon-chocolate.png",
  sortChevron: "/profile/icon-sort-chevron.svg",
  upload: "/profile/icon-upload.svg",
  settings: "/profile/icon-settings.svg",
  listings: "/profile/icon-listings.svg",
  deals: "/profile/icon-deals.svg",
  reviews: "/profile/icon-reviews.svg",
} as const;

export type ProfileSection = "listings" | "deals" | "reviews" | "settings";

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

export function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
