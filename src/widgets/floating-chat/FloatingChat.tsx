"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useAuth, useAuthGate } from "@/features/auth";
import { useChatInbox } from "@/features/chat-inbox";
import {
  connectChatSocket,
  onChatThreadUpdated,
} from "@/shared/api/chat-socket";
import { getChatConversations, openSupportChat, type ChatSummary } from "@/shared/api/chats";
import { ChatBubbleIcon } from "@/shared/ui/icons";

const LINK_CHEVRON_SRC = "/images/chat/link-chevron.svg";
const PANEL_EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
const PANEL_DURATION_MS = 300;

function formatListTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return "Вчера";
}

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

function ChatPanelRow({
  item,
  tabIndex,
  onNavigate,
}: {
  item: ChatSummary;
  tabIndex: number;
  onNavigate: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const href = `/chats?selected=${encodeURIComponent(item.id)}`;
  const preview = item.preview;
  const avatarFallback = item.counterpart.displayName.slice(0, 1).toUpperCase();

  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      onClick={(event) => onNavigate(href, event)}
      className="flex h-[49px] w-[255px] shrink-0 items-end justify-between appearance-none [-webkit-appearance:none] transition hover:opacity-80"
    >
      <span className="flex h-[49px] min-w-0 flex-1 items-start gap-[9px]">
        <span
          className="relative flex size-[49px] shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#D9D9D9] text-[14px] font-extrabold text-[#1A1A1A]"
        >
          {item.counterpart.avatarUrl ? (
            // Storage URL is dynamic and configured by the API.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.counterpart.avatarUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <span aria-hidden>{avatarFallback}</span>
          )}
        </span>

        <span className="flex w-[164px] min-w-0 flex-col items-start text-[#1A1A1A]">
          <span className="w-[153px] truncate text-[14px] font-semibold leading-[1.2] tracking-[0.001em]">
            {item.counterpart.displayName}
          </span>
          <span className="mt-[6px] w-[153px] truncate text-[14px] font-normal leading-[1.2]">
            {preview}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-[8px]">
        <span className="text-right text-[11px] font-semibold leading-4 tracking-[0.002em] text-[#797979]">
          {formatListTime(item.updatedAt)}
        </span>
        {item.unreadCount > 0 ? (
          <span className="chat-badge chat-badge--count">{item.unreadCount}</span>
        ) : null}
      </span>
    </Link>
  );
}

function PanelDivider({ top }: { top: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 z-[2] h-px w-[303px]"
      style={{
        top,
        background: "linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%)",
      }}
    />
  );
}

export function FloatingChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { hasUnreadConversations } = useChatInbox();
  const { guardAuth } = useAuthGate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void connectChatSocket();

    const unsubscribe = onChatThreadUpdated((event) => {
      setItems((current) => {
        if (current.length === 0) return current;
        const index = current.findIndex((item) => item.id === event.threadId);
        if (index < 0) {
          void getChatConversations({ limit: 5 })
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
        return [updated, ...next].slice(0, 5);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void getChatConversations({ limit: 5, signal: controller.signal })
      .then((response) => setItems(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Не удалось загрузить чаты.");
        setItems([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [isAuthenticated, isOpen]);

  if (pathname.startsWith("/chats")) {
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

  const fadeTransition = `opacity ${PANEL_DURATION_MS}ms ${PANEL_EASE}, transform ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;
  const iconFadeTransition = `opacity ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"
    >
      <div
        className="origin-bottom-right will-change-[opacity,transform]"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
          transition: fadeTransition,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden={!isOpen}
      >
        <div className="relative h-[517px] w-[303px]">
          <div
            className="absolute left-0 top-[4px] box-border h-[513px] w-[303px] rounded-[31px] border-2 border-solid border-transparent px-[24px] pt-[24px]"
            style={{
              background:
                "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
            }}
          >
            <div className="flex h-[406px] w-[255px] flex-col items-start gap-[48px]">
              <div className="flex h-[17px] w-[255px] shrink-0 items-center justify-between">
                <h2 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
                  Чаты
                </h2>
                <TextLink
                  href="/chats"
                  label="Все чаты"
                  tabIndex={isOpen ? 0 : -1}
                  onNavigate={handleChatNavigate}
                />
              </div>

              <div className="flex h-[341px] w-[255px] shrink-0 flex-col items-start gap-[24px] overflow-y-auto overflow-x-hidden">
                {loading ? (
                  <p className="m-0 text-[14px] text-[#626262]">Загружаем…</p>
                ) : null}
                {!loading && error ? (
                  <p className="m-0 text-[14px] text-[#FF2056]">{error}</p>
                ) : null}
                {!loading && !error && items.length === 0 ? (
                  <p className="m-0 text-[14px] text-[#626262]">Пока нет чатов.</p>
                ) : null}
                {!loading && !error
                  ? items.map((item) => (
                      <ChatPanelRow
                        key={item.id}
                        item={item}
                        tabIndex={isOpen ? 0 : -1}
                        onNavigate={handleChatNavigate}
                      />
                    ))
                  : null}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-[454px] flex items-center justify-end px-[24px]">
              <TextLink
                href="/chats?support=1"
                label="Поддержка"
                tabIndex={isOpen ? 0 : -1}
                onNavigate={handleOpenSupport}
              />
            </div>

            <PanelDivider top={62} />
            <PanelDivider top={454} />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="pointer-events-auto relative box-border flex size-[52px] shrink-0 items-center justify-center overflow-visible rounded-[19px] border-2 border-solid border-transparent p-[12px] transition hover:brightness-95 [-webkit-transform:translateZ(0)] [transform:translateZ(0)]"
        style={{
          background:
            "linear-gradient(#C8FF00, #C8FF00) padding-box, linear-gradient(90deg, #8E8BED 0%, #C8FF00 100%) border-box",
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
