"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useAuth, useAuthGate } from "@/features/auth";
import { chatSummaryToHref, useChatInbox } from "@/features/chat-inbox";
import {
  connectChatSocket,
  onChatInboxUpdated,
  onChatThreadUpdated,
} from "@/shared/api/chat-socket";
import { getChatConversations, openSupportChat, type ChatSummary } from "@/shared/api/chats";
import { ChatBubbleIcon } from "@/shared/ui/icons";
import { OVERLAY_ANIMATION_MS } from "@/shared/lib/overlay-animation";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { COMPACT_HEADER_QUERY } from "@/widgets/header/constants";
import { ChatList } from "@/widgets/chats/ChatList";

const LINK_CHEVRON_SRC = "/images/chat/link-chevron.svg";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      width={25}
      height={25}
      viewBox="0 0 25 25"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path
        d="M6.5 6.5L18.5 18.5M18.5 6.5L6.5 18.5"
        stroke="currentColor"
        strokeWidth="2.54"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TextLink({
  href,
  label,
  tabIndex,
  onNavigate,
}: {
  href: string;
  label: string;
  tabIndex: number;
  onNavigate: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      onClick={(event) => onNavigate(href, event)}
      className="inline-flex items-center gap-[6px] text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A] transition hover:opacity-70"
    >
      <span>{label}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LINK_CHEVRON_SRC} alt="" aria-hidden className="h-[6px] w-[4px] shrink-0" />
    </Link>
  );
}

function PanelDivider({ top }: { top: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-[2] h-px"
      style={{
        top,
        background: "linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%)",
      }}
    />
  );
}

export function FloatingChat() {
  const router = useRouter();
  const pathname = usePathname();
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
  const { isAuthenticated } = useAuth();
  const { hasUnreadConversations } = useChatInbox();
  const { guardAuth } = useAuthGate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { isRendered: isPanelRendered, isVisible: isPanelVisible } = useOverlayPresence(isOpen);
  const [items, setItems] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPanelVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPanelVisible]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void connectChatSocket();

    const unsubscribe = onChatThreadUpdated((event) => {
      setItems((current) => {
        if (current.length === 0) return current;
        const index = current.findIndex((item) => item.id === event.threadId);
        if (index < 0) {
          void getChatConversations()
            .then((response) => setItems(response.data))
            .catch(() => undefined);
          return current;
        }
        const item = current[index];
        const updated: ChatSummary = {
          ...item,
          preview: event.preview ?? item.preview,
          updatedAt: event.lastMessageAt
            ? typeof event.lastMessageAt === "string"
              ? event.lastMessageAt
              : new Date(event.lastMessageAt).toISOString()
            : item.updatedAt,
          unreadCount:
            typeof event.unreadCount === "number" ? event.unreadCount : item.unreadCount,
        };
        const next = [...current];
        next.splice(index, 1);
        return [updated, ...next];
      });
    });

    const unsubscribeInbox = onChatInboxUpdated(() => {
      void getChatConversations()
        .then((response) => setItems(response.data))
        .catch(() => undefined);
    });

    return () => {
      unsubscribe();
      unsubscribeInbox();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void getChatConversations({ signal: controller.signal })
      .then((response) => setItems(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Не удалось загрузить чаты.");
        setItems([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [isAuthenticated, isOpen]);

  if (isCompact || pathname.startsWith("/chats")) {
    return null;
  }

  const handleChatNavigate = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsOpen(false);
    guardAuth("chat", () => router.push(href));
  };

  const handleOpenSupport = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsOpen(false);
    guardAuth("chat", () => {
      void openSupportChat()
        .then((response) => {
          router.push(`/chats?selected=${encodeURIComponent(response.thread.id)}`);
        })
        .catch(() => {
          router.push(href.startsWith("/chats") ? href : "/chats?support=1");
        });
    });
  };

  const handleToggle = () => {
    if (!isAuthenticated) {
      guardAuth("chat");
      return;
    }

    setIsOpen((open) => !open);
  };

  const iconFadeTransition = `opacity ${OVERLAY_ANIMATION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`;

  return (
    <div
      ref={rootRef}
      className="floating-chat pointer-events-none fixed z-[100]"
    >
      {isPanelRendered ? (
        <div
          className={`floating-chat__overlay ${isPanelVisible ? "is-open" : ""}`}
          aria-hidden={!isPanelVisible}
        >
          <div className="floating-chat__panel relative h-[517px]">
            <div
              className="floating-chat__card absolute left-0 top-[4px] box-border h-[513px] rounded-[31px] border-2 border-solid border-transparent px-[24px] pt-[24px]"
              style={{
                background:
                  "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%) border-box",
              }}
            >
              <div className="flex h-[406px] w-full flex-col items-start gap-[48px]">
                <div className="flex h-[17px] w-full shrink-0 items-center justify-between gap-[12px]">
                  <h2 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
                    Чаты
                  </h2>
                  <TextLink
                    href="/chats"
                    label="Все чаты"
                    tabIndex={isPanelVisible ? 0 : -1}
                    onNavigate={handleChatNavigate}
                  />
                </div>

                <div className="floating-chat__list-wrap">
                  {loading ? (
                    <p className="m-0 text-[14px] text-[#626262]">Загружаем…</p>
                  ) : null}
                  {!loading && error ? (
                    <p className="m-0 text-[14px] text-[#FF2056]">{error}</p>
                  ) : null}
                  {!loading && !error ? (
                    <ChatList
                      items={items}
                      emptyLabel="Пока нет чатов."
                      tabIndex={isPanelVisible ? 0 : -1}
                      onSelect={() => undefined}
                      getItemHref={chatSummaryToHref}
                      onNavigate={handleChatNavigate}
                      className="floating-chat__list"
                    />
                  ) : null}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 top-[454px] flex items-center justify-end px-[24px]">
                <TextLink
                  href="/chats?support=1"
                  label="Поддержка"
                  tabIndex={isPanelVisible ? 0 : -1}
                  onNavigate={handleOpenSupport}
                />
              </div>

              <PanelDivider top={62} />
              <PanelDivider top={454} />
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="floating-chat__fab pointer-events-auto relative box-border flex size-[52px] shrink-0 items-center justify-center overflow-visible rounded-[19px] border-2 border-solid border-transparent p-[12px] transition hover:brightness-95 [-webkit-transform:translateZ(0)] [transform:translateZ(0)]"
        style={{
          background:
            "linear-gradient(#c8ff02, #c8ff02) padding-box, linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%) border-box",
        }}
      >
        {hasUnreadConversations && !isOpen ? (
          <span aria-hidden className="unread-dot unread-dot--fab" />
        ) : null}
        <span className="relative flex size-[27px] items-center justify-center">
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: isOpen ? 0 : 1,
              transition: iconFadeTransition,
            }}
            aria-hidden={isOpen}
          >
            <ChatBubbleIcon className="size-[27px] text-black" />
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: iconFadeTransition,
            }}
            aria-hidden={!isOpen}
          >
            <CloseIcon className="size-[22px] text-black" />
          </span>
        </span>
      </button>
    </div>
  );
}
