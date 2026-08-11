"use client";

import { useMemo } from "react";

import { TickerStarIcon } from "@/shared/ui/icons";

const tickerItems = [
  "Сопровождение сделок до конца",
  "Обмен вместо продажи",
  "Вещи продолжают приносить пользу",
  "Никакого спама в личные сообщения",
  "Каждый получает нужное себе",
  "Показываем то, что вас заинтересует",
] as const;

function TickerPin({ label }: { label: string }) {
  return (
    <div className="home-ticker-pin flex h-[34px] shrink-0 flex-none items-center justify-center gap-[12px] rounded-[16.327px] bg-[#C8FF00] px-[18px] py-[12px]">
      <span className="whitespace-nowrap text-center text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
        {label}
      </span>
    </div>
  );
}

export function TickerCarousel() {
  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div
      className="home-ticker-carousel pointer-events-none absolute left-0 z-20 h-[34px] w-full overflow-hidden"
      style={{
        top: "1040px",
        transform: "translateZ(0)",
      }}
    >
      <div className="home-ticker-track flex w-max items-center gap-[12px]">
        {loopItems.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex shrink-0 items-center gap-[12px]">
            <TickerPin label={item} />
            <TickerStarIcon gradientId={`ticker-star-grad-${idx}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
