"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  chatSummaryToHref,
  formatNotificationTime,
  getNotificationImageFallback,
  getNotificationImageUrl,
  getNotificationSubtitle,
  getNotificationTags,
  getNotificationTitle,
  notificationHasUnread,
} from "@/features/chat-inbox";
import { onChatInboxUpdated, onChatThreadUpdated } from "@/shared/api/chat-socket";
import { getChatNotifications, type ChatSummary } from "@/shared/api/chats";

import { HeaderDropdownPanel } from "./HeaderDropdownPanel";
import { NotificationCard } from "./NotificationCard";
import { useIsolateWheelScroll } from "./useIsolateWheelScroll";

const PREVIEW_LIMIT = 5;
const PAGE_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 72;

type NotificationsDropdownProps = {
  isOpen: boolean;
  onNavigate: () => void;
};

function NotificationList({
  items,
  onItemClick,
}: {
  items: ChatSummary[];
  onItemClick: (item: ChatSummary) => void;
}) {
  return (
    <>
      {items.map((item) => (
        <NotificationCard
          key={item.id}
          title={getNotificationTitle(item)}
          subtitle={getNotificationSubtitle(item)}
          tags={getNotificationTags(item)}
          time={formatNotificationTime(item.updatedAt)}
          href={chatSummaryToHref(item)}
          imageUrl={getNotificationImageUrl(item)}
          avatarFallback={getNotificationImageFallback(item)}
          isSupport={item.kind === "support"}
          hasUnread={notificationHasUnread(item)}
          onNavigate={() => onItemClick(item)}
        />
      ))}
    </>
  );
}

export function NotificationsDropdown({ isOpen, onNavigate }: NotificationsDropdownProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const [items, setItems] = useState<ChatSummary[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const { onMouseEnter, onMouseLeave } = useIsolateWheelScroll(scrollRef);

  const mergeItems = useCallback((incoming: ChatSummary[]) => {
    setItems((current) => {
      const byId = new Map(current.map((item) => [item.id, item]));
      for (const item of incoming) {
        byId.set(item.id, item);
      }
      return [...byId.values()].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
    });
  }, []);

  const loadPage = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        const response = await getChatNotifications({
          cursor: cursor ?? undefined,
          limit: append ? PAGE_LIMIT : PREVIEW_LIMIT,
        });
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
        if (append) {
          mergeItems(response.data);
        } else {
          setItems(response.data);
        }
      } catch {
        if (!append) {
          setError("Не удалось загрузить уведомления.");
          setItems([]);
        }
      } finally {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [mergeItems],
  );

  useEffect(() => {
    if (!isOpen) {
      setExpanded(false);
      return;
    }

    void loadPage();
  }, [isOpen, loadPage]);

  useEffect(() => {
    if (!isOpen) return;

    const refreshPreview = () => {
      void loadPage();
    };

    const unsubscribeThread = onChatThreadUpdated(() => {
      refreshPreview();
    });
    const unsubscribeInbox = onChatInboxUpdated(() => {
      refreshPreview();
    });

    return () => {
      unsubscribeThread();
      unsubscribeInbox();
    };
  }, [isOpen, loadPage]);

  const handleShowAll = () => {
    setExpanded(true);
    if (items.length < PAGE_LIMIT && hasMore) {
      void loadPage(nextCursor, true);
    }
  };

  const handleScroll = () => {
    if (!expanded || !hasMore || loadingMore) return;
    const element = scrollRef.current;
    if (!element) return;

    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remaining > SCROLL_LOAD_THRESHOLD_PX) return;
    void loadPage(nextCursor, true);
  };

  const handleNotificationClick = (item: ChatSummary) => {
    onNavigate();
    router.push(chatSummaryToHref(item));
  };

  const visibleItems = expanded ? items : items.slice(0, PREVIEW_LIMIT);
  const showExpandButton = !expanded && (items.length > PREVIEW_LIMIT || hasMore);

  const listContent = (
    <>
      {loading ? <p className="m-0 w-[364px] text-[14px] text-[#626262]">Загружаем…</p> : null}
      {!loading && error ? (
        <p className="m-0 w-[364px] text-[14px] text-[#FF2056]">{error}</p>
      ) : null}
      {!loading && !error && visibleItems.length === 0 ? (
        <p className="m-0 w-[364px] text-[14px] text-[#626262]">Пока нет уведомлений.</p>
      ) : null}
      {!loading && !error ? (
        <NotificationList
          items={visibleItems.filter(
            (item) => item.notificationKind !== "offer_rejected" || item.isOfferSender !== false,
          )}
          onItemClick={handleNotificationClick}
        />
      ) : null}
      {expanded && loadingMore ? (
        <p className="m-0 w-[364px] text-center text-[14px] text-[#626262]">Загружаем ещё…</p>
      ) : null}
    </>
  );

  return (
    <HeaderDropdownPanel className="box-border flex w-[412px] flex-col items-center justify-center overflow-visible rounded-[31px] p-[24px] text-[#1A1A1A]">
      <div className="flex w-[364px] flex-col items-start gap-[24px]">
        {expanded ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="notifications-dropdown-scroll"
          >
            <div className="flex w-[364px] flex-col items-start gap-[24px]">{listContent}</div>
          </div>
        ) : (
          <div className="flex w-[364px] flex-col items-start gap-[24px]">{listContent}</div>
        )}

        {showExpandButton ? (
          <button
            type="button"
            onClick={handleShowAll}
            className="flex w-[364px] flex-col items-center justify-center gap-[12px] text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A] transition hover:opacity-70"
          >
            Показать все уведомления
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" aria-hidden className="block">
              <path
                d="M1 1L6 5L11 1"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </HeaderDropdownPanel>
  );
}
