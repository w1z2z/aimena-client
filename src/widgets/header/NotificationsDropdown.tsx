"use client";

import { HeaderDropdownPanel } from "./HeaderDropdownPanel";
import { NotificationCard } from "./NotificationCard";

const notifications = [
  {
    id: "1",
    title: "Вам предложили обмен",
    tags: ['MacBook Pro 14" M3 Хо', "Apple Watch"],
    time: "Вчера",
    href: "/chats",
  },
  {
    id: "2",
    title: "Предложение принято!",
    subtitle: "Свяжитесь с владельцем",
    time: "Сегодня",
    href: "/chats",
  },
  {
    id: "3",
    title: "Ваше предложение отклонено",
    tags: ["Sony PlayStation 5"],
    time: "Вчера",
    href: "/chats",
  },
  {
    id: "4",
    title: "Предложение принято!",
    subtitle: "Свяжитесь с владельцем",
    time: "Сегодня",
    href: "/chats",
  },
  {
    id: "5",
    title: "Ваше предложение отклонено",
    tags: ["Sony PlayStation 5"],
    time: "Вчера",
    href: "/chats",
  },
] as const;

export function NotificationsDropdown() {
  return (
    <HeaderDropdownPanel className="box-border flex w-[412px] flex-col items-center justify-center rounded-[31px] bg-[#FFFFFF] p-[24px] text-[#1A1A1A]">
      <div className="flex w-full flex-col items-stretch gap-[24px]">
        {notifications.map((item) => (
          <NotificationCard
            key={item.id}
            title={item.title}
            subtitle={"subtitle" in item ? item.subtitle : undefined}
            tags={"tags" in item ? [...item.tags] : undefined}
            time={item.time}
            href={"href" in item ? item.href : undefined}
          />
        ))}

        <button
          type="button"
          className="flex w-full flex-col items-center justify-center gap-[12px] pt-[4px] text-[14px] font-semibold leading-[130%] tracking-[0.001em] text-[#1A1A1A] transition hover:opacity-70"
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
    </HeaderDropdownPanel>
  );
}
