"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useAuth, useAuthGate } from "@/features/auth";
import { ChatBubbleIcon } from "@/shared/ui/icons";

type ChatPreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
  hasUnread?: boolean;
  avatarUrl: string;
};

const CHAT_AVATAR_SRC = "/images/chat/panel-avatar.png";
const LINK_CHEVRON_SRC = "/images/chat/link-chevron.svg";
const PANEL_DIVIDER_SRC = "/images/chat/panel-divider.svg";

const chatPreviews: ChatPreview[] = [
  {
    id: "1",
    name: "Иван Петросенков",
    preview: "Спасибо все удачно...",
    time: "Вчера",
    hasUnread: true,
    avatarUrl: CHAT_AVATAR_SRC,
  },
  {
    id: "2",
    name: "Иван Петросенков",
    preview: "Спасибо все удачно...",
    time: "Вчера",
    hasUnread: true,
    avatarUrl: CHAT_AVATAR_SRC,
  },
  {
    id: "3",
    name: "Иван Петросенков",
    preview: "Спасибо все удачно...",
    time: "Вчера",
    hasUnread: true,
    avatarUrl: CHAT_AVATAR_SRC,
  },
  {
    id: "4",
    name: "Иван Петросенков",
    preview: "Спасибо все удачно...",
    time: "Вчера",
    hasUnread: true,
    avatarUrl: CHAT_AVATAR_SRC,
  },
  {
    id: "5",
    name: "Иван Петросенков",
    preview: "Спасибо все удачно...",
    time: "Вчера",
    hasUnread: true,
    avatarUrl: CHAT_AVATAR_SRC,
  },
];

const PANEL_EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
const PANEL_DURATION_MS = 300;

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
      className="inline-flex items-center gap-[6px] text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] transition hover:opacity-70"
    >
      <span className="[text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">{label}</span>
      <img src={LINK_CHEVRON_SRC} alt="" aria-hidden className="h-[6px] w-[4px] shrink-0" />
    </Link>
  );
}

function ChatPanelRow({
  chat,
  href,
  tabIndex,
  onNavigate,
}: {
  chat: ChatPreview;
  href: string;
  tabIndex: number;
  onNavigate: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      onClick={(event) => onNavigate(href, event)}
      className="flex w-full items-end justify-between gap-2 transition hover:opacity-80"
    >
      <span className="flex min-w-0 flex-1 items-start gap-[9px]">
        <span className="relative size-[49px] shrink-0">
          <span className="relative block size-[49px] overflow-hidden rounded-[15px] bg-[#D9D9D9]">
            <img
              src={chat.avatarUrl}
              alt=""
              className="absolute left-[-31%] top-0 h-full w-[178%] max-w-none object-cover"
            />
          </span>
          {chat.hasUnread ? (
            <span
              aria-hidden
              className="absolute right-0 top-0 size-[4px] rounded-full bg-[#FF2056]"
            />
          ) : null}
        </span>

        <span className="flex h-[49px] w-[164px] min-w-0 flex-col items-start gap-[12px] text-[#1A1A1A]">
          <span className="w-full truncate text-[14px] font-semibold leading-[1.2] tracking-[0.014px] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
            {chat.name}
          </span>
          <span className="w-full truncate text-[14px] font-normal leading-[1.7] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
            {chat.preview}
          </span>
        </span>
      </span>

      <span className="shrink-0 text-right text-[11px] font-semibold leading-4 tracking-[0.022px] text-[#1A1A1A] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
        {chat.time}
      </span>
    </Link>
  );
}

export function FloatingChat() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { guardAuth } = useAuthGate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleChatNavigate = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    guardAuth("chat", () => router.push(href));
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
        className="pointer-events-auto origin-bottom-right will-change-[opacity,transform]"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
          transition: fadeTransition,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden={!isOpen}
      >
        <div className="relative box-border flex h-[513px] w-[303px] flex-col items-end justify-center gap-[48px] rounded-[31px] bg-white p-[24px]">
          <div className="flex w-[255px] flex-col items-start gap-[48px]">
            <div className="flex w-full items-center justify-between">
              <h2 className="m-0 text-[24px] font-extrabold leading-[1.1] tracking-[-0.072px] text-[#1A1A1A] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
                Чаты
              </h2>
              <TextLink
                href="/chats"
                label="Все чаты"
                tabIndex={isOpen ? 0 : -1}
                onNavigate={handleChatNavigate}
              />
            </div>

            <div className="flex w-full flex-col items-start gap-[24px]">
              {chatPreviews.map((chat) => (
                <ChatPanelRow
                  key={chat.id}
                  chat={chat}
                  href="/chats"
                  tabIndex={isOpen ? 0 : -1}
                  onNavigate={handleChatNavigate}
                />
              ))}
            </div>
          </div>

          <TextLink
            href="/chats"
            label="Поддержка"
            tabIndex={isOpen ? 0 : -1}
            onNavigate={handleChatNavigate}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-[62px] h-px w-full"
          >
            <img src={PANEL_DIVIDER_SRC} alt="" className="block h-px w-full" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-[454px] h-px w-full"
          >
            <img src={PANEL_DIVIDER_SRC} alt="" className="block h-px w-full" />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="pointer-events-auto relative flex size-[52px] shrink-0 items-center justify-center rounded-[19px] bg-[#C8FF00] p-[12px] transition hover:brightness-95"
      >
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
