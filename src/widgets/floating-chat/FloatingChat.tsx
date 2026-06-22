"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { ChatBubbleIcon } from "@/shared/ui/icons";

type ChatPreview = {
  id: string;
  hasUnread?: boolean;
};

const chatPreviews: ChatPreview[] = [
  { id: "support", hasUnread: true },
  { id: "2", hasUnread: true },
  { id: "3" },
  { id: "4" },
  { id: "5", hasUnread: true },
];

const PANEL_EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
const PANEL_DURATION_MS = 300;
const BUTTON_HEIGHT_PX = 67;

function NotificationDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-[7px] rounded-full bg-[#FF2056] ${className ?? ""}`}
    />
  );
}

function ChatBubbleWithBadge({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      <ChatBubbleIcon className="size-full text-[#1A1A1A]" />
      <NotificationDot className="right-0 top-0 translate-x-[15%] -translate-y-[15%]" />
    </span>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 25 25" fill="none" aria-hidden className={className}>
      <path
        d="M6.5 6.5L18.5 18.5M18.5 6.5L6.5 18.5"
        stroke="currentColor"
        strokeWidth="2.54"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatAvatarButton({
  chat,
  href,
  tabIndex,
}: {
  chat: ChatPreview;
  href: string;
  tabIndex: number;
}) {
  return (
    <Link
      href={href}
      aria-label="Открыть чат"
      tabIndex={tabIndex}
      className="relative block size-[40px] shrink-0 rounded-full bg-[#1A1A1A] transition hover:brightness-125"
    >
      {chat.hasUnread ? (
        <NotificationDot className="right-0 top-0" />
      ) : null}
    </Link>
  );
}

export function FloatingChat() {
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [listHeight, setListHeight] = useState(0);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateHeight = () => {
      setListHeight(list.scrollHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(list);

    return () => observer.disconnect();
  }, []);

  const heightTransition = `height ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;
  const slideTransition = `transform ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;
  const morphTransition = `height ${PANEL_DURATION_MS}ms ${PANEL_EASE}, background-color ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;
  const fadeTransition = `opacity ${PANEL_DURATION_MS}ms ${PANEL_EASE}`;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] w-[72px]">
      <div className="pointer-events-auto flex w-[72px] flex-col">
        <div
          className="w-[72px] overflow-hidden will-change-[height]"
          style={{
            height: isOpen ? listHeight : 0,
            transition: heightTransition,
          }}
        >
          <div
            ref={listRef}
            className="w-[72px] origin-bottom will-change-transform"
            style={{
              transform: isOpen ? "translateY(0)" : "translateY(100%)",
              transition: slideTransition,
            }}
          >
            <div
              className="flex w-[72px] flex-col items-center rounded-t-[15.87px] border border-b-0 border-[#C8FF00] bg-[#F5FFE8] px-[8px] pt-[18px] pb-[14px]"
              aria-hidden={!isOpen}
            >
              <Link
                href="/chats"
                aria-label="Все чаты"
                tabIndex={isOpen ? 0 : -1}
                className="mb-[16px] flex h-[24px] w-[27px] items-center justify-center"
              >
                <ChatBubbleWithBadge className="size-full" />
              </Link>

              <div className="flex flex-col items-center gap-[10px]">
                {chatPreviews.map((chat) => (
                  <ChatAvatarButton
                    key={chat.id}
                    chat={chat}
                    href="/chats"
                    tabIndex={isOpen ? 0 : -1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`w-[72px] shrink-0 transition-[background-color,padding,border-radius] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
            isOpen
              ? "rounded-b-[15.87px] border border-t-0 border-[#C8FF00] bg-[#F5FFE8] px-[8px] pb-[8px]"
              : "bg-transparent p-0"
          }`}
        >
          <button
            type="button"
            aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className={`flex w-full items-center justify-center border border-black ${
              isOpen
                ? "rounded-[13.27px] bg-[#1A1A1A] hover:bg-[#2a2a2a]"
                : "rounded-[13.27px] bg-[#C8FF00] hover:brightness-95"
            }`}
            style={{
              height: isOpen ? 50 : BUTTON_HEIGHT_PX,
              transition: morphTransition,
            }}
          >
            <span className="relative flex size-[32px] items-center justify-center">
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: isOpen ? 0 : 1,
                  transition: fadeTransition,
                }}
                aria-hidden={isOpen}
              >
                <ChatBubbleWithBadge className="size-[32px]" />
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: fadeTransition,
                }}
                aria-hidden={!isOpen}
              >
                <CloseIcon className="size-[22px] text-white" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
