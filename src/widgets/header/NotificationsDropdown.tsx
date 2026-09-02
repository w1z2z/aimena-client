"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  chatSummaryToHref,
  formatChatListTime,
  getNotificationCounterpartName,
  getNotificationDealMedia,
  getNotificationTitle,
  notificationHasUnread,
} from "@/features/chat-inbox";
import { NotificationDealMedia } from "@/features/chat-inbox/NotificationDealMedia";
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
      {items.map((item) => {
        const media = getNotificationDealMedia(item);

        return (
          <NotificationCard
            key={item.id}
            title={getNotificationTitle(item)}
            counterpartName={getNotificationCounterpartName(item)}
            time={formatChatListTime(item.updatedAt)}
            href={chatSummaryToHref(item)}
            media={
              media ? (
                <NotificationDealMedia mine={media.mine} theirs={media.theirs} />
              ) : null
            }
            hasUnread={notificationHasUnread(item)}
            onNavigate={() => onItemClick(item)}
          />
        );
      })}
    </>
  );
}

export function NotificationsDropdown({ isOpen, onNavigate }: NotificationsDropdownProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const [items, setItems] = useState<ChatSummary[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const [footerHiding, setFooterHiding] = useState(false);
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
      setPreviewHeight(null);
      setExpandedHeight(null);
      setFooterHiding(false);
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

  const filteredItems = items.filter(
    (item) => item.notificationKind !== "offer_rejected" || item.isOfferSender !== false,
  );
  const visibleItems = expanded ? filteredItems : filteredItems.slice(0, PREVIEW_LIMIT);
  const showExpandButton = !expanded && (filteredItems.length > PREVIEW_LIMIT || hasMore);

  useLayoutEffect(() => {
    if (expanded || loading) return;
    const element = scrollRef.current;
    if (!element) return;
    setPreviewHeight(element.scrollHeight);
  }, [expanded, loading, visibleItems.length, error]);

  const handleShowAll = () => {
    const viewport = scrollRef.current;
    const footer = footerRef.current;
    if (!viewport) return;

    const footerHeight = footer?.offsetHeight ?? 0;
    const footerGap = footerHeight > 0 ? 24 : 0;
    const targetHeight = viewport.scrollHeight + footerHeight + footerGap;

    setExpandedHeight(targetHeight);
    setFooterHiding(true);
    setExpanded(true);

    window.setTimeout(() => {
      setFooterHiding(false);
    }, 280);

    if (items.length < PAGE_LIMIT && hasMore) {
      void loadPage(nextCursor, true);
    }
  };

  const viewportHeight = expanded
    ? (expandedHeight ?? previewHeight ?? undefined)
    : (previewHeight ?? undefined);

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

  const listContent = (
    <>
      {loading ? <p className="m-0 w-full text-[14px] text-[#626262]">Загружаем…</p> : null}
      {!loading && error ? (
        <p className="m-0 w-full text-[14px] text-[#FF2056]">{error}</p>
      ) : null}
      {!loading && !error && visibleItems.length === 0 ? (
        <p className="m-0 w-full text-[14px] text-[#626262]">Пока нет уведомлений.</p>
      ) : null}
      {!loading && !error ? (
        <NotificationList items={visibleItems} onItemClick={handleNotificationClick} />
      ) : null}
      {expanded && loadingMore ? (
        <p className="m-0 w-full text-center text-[14px] text-[#626262]">Загружаем ещё…</p>
      ) : null}
    </>
  );

  return (
    <HeaderDropdownPanel className="notifications-dropdown-panel box-border flex w-[412px] max-w-full flex-col items-center justify-center overflow-hidden rounded-[31px] p-[24px] text-[#1A1A1A]">
      <div
        className={`notifications-dropdown-inner flex w-full max-w-[364px] flex-col items-start${
          expanded ? " notifications-dropdown-inner--expanded" : ""
        }`}
      >
        <div
          className={`notifications-dropdown-scroll-host${
            expanded ? " is-expanded" : ""
          }`}
        >
          <div
            ref={scrollRef}
            onScroll={expanded ? handleScroll : undefined}
            onMouseEnter={expanded ? onMouseEnter : undefined}
            onMouseLeave={expanded ? onMouseLeave : undefined}
            className={`notifications-dropdown-viewport header-notifications-scroll${
              expanded ? " is-expanded" : ""
            }`}
            style={viewportHeight ? { height: viewportHeight } : undefined}
          >
            <div className="notifications-dropdown-list flex w-full flex-col items-start gap-[24px]">
              {listContent}
            </div>
          </div>
        </div>

        {showExpandButton || footerHiding ? (
          <div
            ref={footerRef}
            className={`notifications-dropdown-footer${footerHiding ? " is-hiding" : ""}`}
          >
            <button
              type="button"
              onClick={handleShowAll}
              disabled={footerHiding}
              className="notifications-dropdown-expand flex w-full flex-col items-center justify-center gap-[12px] text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A] transition hover:opacity-70"
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
          </div>
        ) : null}
      </div>
    </HeaderDropdownPanel>
  );
}
