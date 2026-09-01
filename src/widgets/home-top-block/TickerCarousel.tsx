"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import { TickerStarIcon } from "@/shared/ui/icons";

const tickerItems = [
  "Сопровождение сделок до конца",
  "Обмен вместо продажи",
  "Вещи продолжают приносить пользу",
  "Никакого спама в личные сообщения",
  "Каждый получает нужное себе",
  "Показываем то, что вас заинтересует",
  "Несколько вещей в одном предложении",
  "Обмен в вашем городе",
  "Найдите вариант, о котором не думали",
  "Рядом много интересного",
  "Меняйте и вещи, и услуги",
  "Репутация складывается из обменов",
] as const;

const TICKER_SPEED_PX_PER_SEC = 50;

function TickerPin({ label }: { label: string }) {
  return (
    <div className="home-ticker-pin">
      <span className="home-ticker-pin__label">{label}</span>
    </div>
  );
}

function TickerSet({
  items,
  idPrefix,
  compact,
  setRef,
}: {
  items: string[];
  idPrefix: string;
  compact: boolean;
  setRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={setRef} className="home-ticker-track__set">
      {items.map((item, idx) => (
        <div key={`${idPrefix}-${item}-${idx}`} className="home-ticker-carousel__item">
          <TickerPin label={item} />
          <TickerStarIcon
            className="home-ticker-star"
            gradientId={`${idPrefix}-star-${idx}${compact ? "-c" : ""}`}
          />
        </div>
      ))}
    </div>
  );
}

export function TickerCarousel({ compact = false }: { compact?: boolean }) {
  const [sequenceRepeats, setSequenceRepeats] = useState(1);
  const [loopWidth, setLoopWidth] = useState(0);
  const baseMeasureRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  const oneSequence = useMemo(
    () => Array.from({ length: sequenceRepeats }, () => tickerItems).flat(),
    [sequenceRepeats],
  );

  useLayoutEffect(() => {
    const measureBase = () => {
      const baseWidth = baseMeasureRef.current?.scrollWidth ?? 0;
      if (baseWidth === 0) return;
      const needed = Math.max(1, Math.ceil((window.innerWidth * 2) / baseWidth));
      setSequenceRepeats((current) => (current === needed ? current : needed));
    };

    measureBase();
    window.addEventListener("resize", measureBase, { passive: true });
    return () => window.removeEventListener("resize", measureBase);
  }, [compact]);

  useLayoutEffect(() => {
    const el = setRef.current;
    if (!el) return;

    const update = () => setLoopWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [oneSequence, compact]);

  const trackStyle = {
    "--home-ticker-loop-width": `${loopWidth}px`,
    "--home-ticker-duration": `${Math.max(loopWidth / TICKER_SPEED_PX_PER_SEC, 12)}s`,
  } as CSSProperties;

  return (
    <>
      <div className="home-ticker-measure" aria-hidden>
        <TickerSet
          items={[...tickerItems]}
          idPrefix="measure"
          compact={compact}
          setRef={baseMeasureRef}
        />
      </div>

      <div
        className={
          compact
            ? "home-ticker-carousel home-ticker-carousel--compact home-ticker-carousel--viewport pointer-events-none z-20 overflow-hidden"
            : "home-ticker-carousel home-ticker-carousel--desktop home-ticker-carousel--viewport pointer-events-none overflow-hidden"
        }
      >
        <div
          className={`home-ticker-track${loopWidth > 0 ? " is-ready" : ""}`}
          style={trackStyle}
        >
          <TickerSet items={oneSequence} idPrefix="a" compact={compact} setRef={setRef} />
          <TickerSet items={oneSequence} idPrefix="b" compact={compact} />
        </div>
      </div>
    </>
  );
}
