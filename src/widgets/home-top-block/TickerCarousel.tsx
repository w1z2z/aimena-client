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
    <div className="home-ticker-pin">
      <span className="home-ticker-pin__label">{label}</span>
    </div>
  );
}

export function TickerCarousel({ compact = false }: { compact?: boolean }) {
  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div
      className={
        compact
          ? "home-ticker-carousel home-ticker-carousel--compact pointer-events-none z-20 w-full overflow-hidden"
          : "home-ticker-carousel pointer-events-none absolute left-0 z-20 w-full overflow-hidden"
      }
      style={
        compact
          ? { transform: "translateZ(0)" }
          : {
              top: "1040px",
              transform: "translateZ(0)",
            }
      }
    >
      <div className="home-ticker-track">
        {loopItems.map((item, idx) => (
          <div key={`${item}-${idx}`} className="home-ticker-carousel__item">
            <TickerPin label={item} />
            <TickerStarIcon
              className="home-ticker-star"
              gradientId={`ticker-star-grad-${idx}${compact ? "-c" : ""}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
