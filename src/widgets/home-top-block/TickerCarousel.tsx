"use client";

import { useMemo } from "react";

import { BoltIcon } from "@/shared/ui/icons";

const tickerItems = [
  "Сопровождение сделок до конца",
  "Обмен вместо продажи",
  "Вещи продолжают приносить пользу",
  "Никакого спама в личные сообщения",
  "Каждый получает нужное себе",
  "Показываем то, что вас заинтересует",
] as const;

type TickerPinGlowRect = {
  left?: string;
  right?: string;
  top: string;
};

const tickerPinGlowRects: TickerPinGlowRect[] = [
  { right: "19px", top: "-2px" },
  { left: "-8px", top: "17px" },
];

function TickerPin({ label }: { label: string }) {
  return (
    <div className="home-ticker-pin glass-surface relative flex h-[34px] shrink-0 flex-none items-center justify-center gap-[12px] overflow-hidden rounded-[16.327px] px-[18px] py-[12px]">
      {tickerPinGlowRects.map((rect) => (
        <span
          key={`${rect.left ?? rect.right}-${rect.top}`}
          aria-hidden
          className="pointer-events-none absolute z-[1] size-[20.48px] rounded-full blur-[14px] [transform:translateZ(0)]"
          style={{
            left: rect.left,
            right: rect.right,
            top: rect.top,
            backgroundColor: "#8E8BED",
            transform: "rotate(-39.36deg)",
          }}
        />
      ))}
      <span className="relative z-[2] flex items-center whitespace-nowrap text-center text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-white">
        {label}
      </span>
    </div>
  );
}

function TickerBolt() {
  return (
    <span className="flex h-[25.163px] w-[18.815px] shrink-0 items-center justify-center">
      <BoltIcon className="h-[24.4428px] w-[15.4656px] rotate-[15deg]" />
    </span>
  );
}

export function TickerCarousel() {
  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div
      className="home-ticker-carousel pointer-events-none absolute left-[-141px] z-20 h-[34px] w-[2111px] overflow-hidden"
      style={{
        top: "1040px",
        transform: "translateZ(0)",
      }}
    >
      <div className="home-ticker-track flex w-max items-center gap-[12px]">
        {loopItems.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex shrink-0 items-center gap-[12px]">
            <TickerPin label={item} />
            <TickerBolt />
          </div>
        ))}
      </div>
    </div>
  );
}
