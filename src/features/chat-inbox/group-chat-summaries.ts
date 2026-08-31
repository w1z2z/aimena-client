import type { ChatProfile, ChatSummary } from "@/shared/api/chats";

export type ChatListGroup = {
  id: string;
  counterpart: ChatProfile;
  isSupport: boolean;
  items: ChatSummary[];
  latestItem: ChatSummary;
  totalUnread: number;
  hasOfferBadge: boolean;
};

function groupKey(item: ChatSummary) {
  if (item.kind === "support") return `support:${item.id}`;
  return `person:${item.counterpart.id}`;
}

function sortByActivity(items: ChatSummary[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function buildGroup(key: string, items: ChatSummary[]): ChatListGroup {
  const sorted = sortByActivity(items);
  const latestItem = sorted[0];
  return {
    id: key,
    counterpart: latestItem.counterpart,
    isSupport: latestItem.kind === "support",
    items: sorted,
    latestItem,
    totalUnread: sorted.reduce((sum, item) => sum + item.unreadCount, 0),
    hasOfferBadge: sorted.some(
      (item) => item.kind === "offer" && item.notificationKind !== "offer_rejected",
    ),
  };
}

/** Groups inbox rows by counterpart; support chats stay separate and pinned first. */
export function groupChatSummaries(items: ChatSummary[]): ChatListGroup[] {
  const supportKeys: string[] = [];
  const personKeys: string[] = [];
  const buckets = new Map<string, ChatSummary[]>();

  for (const item of items) {
    const key = groupKey(item);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
      if (item.kind === "support") supportKeys.push(key);
      else personKeys.push(key);
    }
  }

  const supportGroups = supportKeys.map((key) => buildGroup(key, buckets.get(key)!));
  const personGroups = personKeys
    .map((key) => buildGroup(key, buckets.get(key)!))
    .sort(
      (left, right) =>
        new Date(right.latestItem.updatedAt).getTime() -
        new Date(left.latestItem.updatedAt).getTime(),
    );

  return [...supportGroups, ...personGroups];
}

export function findChatListGroup(
  groups: ChatListGroup[],
  chatId: string | null | undefined,
) {
  if (!chatId) return null;
  return groups.find((group) => group.items.some((item) => item.id === chatId)) ?? null;
}
