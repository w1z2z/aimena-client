"use client";

import { useRef } from "react";

import { HeaderDropdownPanel } from "./HeaderDropdownPanel";
import {
  NOTIFICATION_CARD_GAP,
  NOTIFICATION_CARD_HEIGHT,
  NotificationCard,
} from "./NotificationCard";
import { useIsolateWheelScroll } from "./useIsolateWheelScroll";

const VISIBLE_NOTIFICATIONS_COUNT = 5;
const notificationsListHeight =
  VISIBLE_NOTIFICATIONS_COUNT * NOTIFICATION_CARD_HEIGHT +
  (VISIBLE_NOTIFICATIONS_COUNT - 1) * NOTIFICATION_CARD_GAP;

const notifications = [
  {
    id: "1",
    title: "🔄  Вам предложили обмен",
    subtitle: "Мария В.",
    badge: 'MacBook 14"',
    time: "12:33",
    href: "/chats",
  },
  {
    id: "2",
    title: "✅  Предложение принято!",
    subtitle: "Алексей К.",
    time: "11:33",
    href: "/chats",
  },
  {
    id: "3",
    title: "💬  Иван К. написал сообщение",
    badge: 'MacBook 14"',
    time: "10:33",
    href: "/chats",
  },
  {
    id: "4",
    title: "🔄  Вам предложили обмен",
    subtitle: "Василий М.",
    badge: "Samsung S25 Ultra",
    time: "12:33",
    href: "/chats",
  },
  {
    id: "5",
    title: "❌  Ваше предложение отклонено",
    subtitle: "Кирилл Р.",
    badge: "Toyota Camry",
    time: "12:33",
  },
  {
    id: "6",
    title: "⭐  Объявление добавлено в избранное",
    subtitle: "Ольга С.",
    badge: "iPhone 15 Pro",
    time: "09:15",
    href: "/chats",
  },
  {
    id: "7",
    title: "💬  Новое сообщение по обмену",
    subtitle: "Дмитрий К.",
    badge: "PlayStation 5",
    time: "08:42",
    href: "/chats",
  },
] as const;

export function NotificationsDropdown() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { onMouseEnter, onMouseLeave } = useIsolateWheelScroll(scrollRef);

  return (
    <HeaderDropdownPanel
      className="w-[334px] bg-[#F2F4F7] p-[10px]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={scrollRef}
        className="header-notifications-scroll flex flex-col gap-[10px] overflow-x-hidden overflow-y-auto pr-[8px]"
        style={{ height: `${notificationsListHeight}px` }}
      >
        {notifications.map((item) => (
          <NotificationCard
            key={item.id}
            title={item.title}
            subtitle={"subtitle" in item ? item.subtitle : undefined}
            badge={"badge" in item ? item.badge : undefined}
            time={item.time}
            href={"href" in item ? item.href : undefined}
          />
        ))}
      </div>
      <button
        type="button"
        className="mt-[10px] flex h-[22px] w-full items-center justify-center font-[family-name:var(--font-golos)] text-[17px] leading-none tracking-[-0.022em] text-[#1A1A1A] underline"
      >
        Показать все уведомления
      </button>
    </HeaderDropdownPanel>
  );
}
