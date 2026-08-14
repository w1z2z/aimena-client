export function excludeOwnListings<T extends { ownerId: string }>(
  items: T[],
  viewerId?: string | null,
): T[] {
  if (!viewerId) return items;
  return items.filter((item) => item.ownerId !== viewerId);
}
