/* eslint-disable @next/next/no-img-element */
"use client";

import { type WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BoltIcon,
  categoryItems,
  getCategoryIconSrc,
  ChatBubbleIcon,
  ExchangeBadgeIcon,
  TagsIcon,
  WantAllIcon,
  WantBrowseIcon,
  WantExchangeIcon,
} from "@/shared/ui/icons";
import { Header } from "@/widgets/header/Header";

const imgHeroCard = "https://www.figma.com/api/mcp/asset/03e5747b-db77-495a-a0bc-3d74a40d9e94";

type Mode = "exchange" | "browse" | "all";

const cityOptions = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"];
const conditionOptions = ["Отличное", "Новое", "Хорошее", "Б.у", "Требует ремонта"];

const titlePlaceholder = 'MacBook Pro 14" M3 Pro';
const pricePlaceholder = "~ 100 000р";
const cityPlaceholder = "Краснодар";

const fieldClassName =
  "rounded-[10px] border border-[#CACACA] bg-white px-[12px] font-semibold text-[#3D3D3D] outline-none placeholder:text-[#626262]";

function renderTabIcon(tabId: Mode, active: boolean) {
  if (tabId === "exchange") return <WantExchangeIcon className="h-[17px] w-[15px]" />;
  if (tabId === "browse") return <WantBrowseIcon active={active} className="h-4 w-4" />;
  return <WantAllIcon active={active} className="h-4 w-4" />;
}

function HeroCard() {
  return (
    <div className="w-[342px] rounded-[10px] bg-white py-[12px] shadow-[0px_5px_4.95px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex h-[29px] w-[318px] items-center justify-center rounded-t-[10px] text-[18px] font-semibold text-[#1A1A1A]">
        MacBook Pro 14&quot; M3 Хо
      </div>
      <div className="relative mt-[12px] h-[342px] w-[342px] overflow-hidden">
        <img src={imgHeroCard} alt="" className="h-full w-full object-cover" />
        <div className="absolute bottom-[9px] left-[8px] flex gap-[6px]">
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            Москва
          </span>
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            Хорошее
          </span>
        </div>
      </div>
      <div className="mx-auto mt-[12px] flex min-h-[44px] w-[321px] items-center gap-[6px] rounded-[9px] border border-[#8E8BED] border-[0.3px] bg-[#F9F7FF] px-[8px]">
        <TagsIcon className="h-[11px] w-[11px] rotate-180 text-[#8E8BED]" />
        <span className="rounded-[39px] border border-[#8E8BED] border-[0.5px] bg-[#F2F4F7] px-[8px] py-[4px] text-[11px] font-semibold text-[#1A1A1A]">
          Sony PlayStation 5
        </span>
        <span className="rounded-[39px] border border-[#8E8BED] border-[0.5px] bg-[#F2F4F7] px-[8px] py-[4px] text-[11px] font-semibold text-[#1A1A1A]">
          Монитор 4K
        </span>
        <span className="text-[11px] text-[#626262]">+5</span>
      </div>
    </div>
  );
}

const recommendedCards = Array.from({ length: 5 }, (_, idx) => ({
  id: idx + 1,
}));

function CenterExchangeBadge() {
  return (
    <button
      type="button"
      aria-label="Подобрать обмен"
      className="absolute bottom-[20.19%] left-[46.3%] right-[37.82%] top-[49.35%] cursor-pointer rounded-full border-0 bg-transparent p-0 transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
    >
      <div className="relative h-full w-full">
        <svg viewBox="0 0 163 163" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="81.5" cy="81.5" r="81.5" fill="#1A1A1A" />
          <ellipse cx="81.5" cy="81" rx="71" ry="71" fill="#000000" stroke="#CACACA" strokeWidth="2.5" />
        </svg>

        <div className="pointer-events-none absolute left-[53px] top-[31px] h-[48.45px] w-[58.45px]">
          <ExchangeBadgeIcon className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-[55.64%_19.02%_24.73%_20.86%] flex items-center justify-center text-center text-[16px] font-bold leading-[20px] tracking-[0.001em] text-white">
          Подобрать обмен
        </div>
      </div>
    </button>
  );
}

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
    <div className="relative isolate flex h-[34px] shrink-0 flex-none items-center justify-center gap-[12px] overflow-hidden rounded-[16.327px] border border-[0.3px] border-white/30 bg-[rgba(0,0,0,0.004)] px-[18px] py-[12px]">
      {tickerPinGlowRects.map((rect) => (
        <span
          key={`${rect.left ?? rect.right}-${rect.top}`}
          aria-hidden
          className="pointer-events-none absolute z-[1] size-[20.48px] blur-[14px]"
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
      <BoltIcon className="h-[22.443px] w-[13.466px] rotate-[15deg]" />
    </span>
  );
}

function TickerCarousel() {
  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div className="pointer-events-none absolute left-[-96px] top-[1172px] z-20 h-[34px] w-[2118px] overflow-hidden">
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

function normalizeIndex(index: number, length: number) {
  if (length <= 0) return 0;
  const result = index % length;
  return result < 0 ? result + length : result;
}

function getWrappedDistanceFloat(index: number, activeIndex: number, length: number) {
  let rawDistance = index - activeIndex;
  while (rawDistance > length / 2) rawDistance -= length;
  while (rawDistance < -length / 2) rawDistance += length;
  return rawDistance;
}

function getShortestDelta(from: number, to: number, length: number) {
  let delta = to - from;
  if (delta > length / 2) delta -= length;
  if (delta < -length / 2) delta += length;
  return delta;
}

const ARC_CENTER_X = 720;
const ARC_HORIZONTAL_RADIUS = 620;
const ARC_VERTICAL_RADIUS = 170;
const ARC_BASE_Y = 245;
const ARC_ACTIVE_ICON_SIZE = 102;
const ARC_GLOW_HORIZONTAL_RADIUS = 735;
const ARC_ANGLE_STEP = 17.5;
const ARC_ACTIVE_ICON_CENTER_Y = ARC_BASE_Y - ARC_VERTICAL_RADIUS + ARC_ACTIVE_ICON_SIZE / 2;
const ARC_GLOW_BASE_Y = ARC_ACTIVE_ICON_CENTER_Y + ARC_VERTICAL_RADIUS;
const ARC_GLOW_PATH = `M ${ARC_CENTER_X - ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y} A ${ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_VERTICAL_RADIUS} 0 0 1 ${ARC_CENTER_X + ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y}`;

function CategoriesArc() {
  const initialIndex = Math.max(
    0,
    categoryItems.findIndex((item) => item.id === "all"),
  );
  const length = categoryItems.length;
  const [displayIndex, setDisplayIndex] = useState(initialIndex);
  const displayIndexRef = useRef(initialIndex);
  const currentCategoryIndexRef = useRef(initialIndex);
  const animationRef = useRef<number | null>(null);
  const nextWheelAllowedAtRef = useRef(0);

  const animateDisplayIndex = useCallback(
    (targetValue: number, duration: number, onComplete?: () => void) => {
      const from = displayIndexRef.current;
      const delta = targetValue - from;

      if (Math.abs(delta) < 0.001) {
        onComplete?.();
        return;
      }

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const current = from + delta * eased;

        displayIndexRef.current = current;
        setDisplayIndex(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
          return;
        }

        displayIndexRef.current = targetValue;
        setDisplayIndex(targetValue);
        animationRef.current = null;
        onComplete?.();
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [],
  );

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const settled = normalizeIndex(targetIndex, length);
      const from = displayIndexRef.current;
      const delta = getShortestDelta(from, settled, length);

      animateDisplayIndex(from + delta, Math.min(520, 260 + Math.abs(delta) * 70), () => {
        currentCategoryIndexRef.current = settled;
      });
    },
    [animateDisplayIndex, length],
  );

  const stepCarousel = useCallback(
    (direction: 1 | -1) => {
      if (animationRef.current !== null) {
        return;
      }

      const nextIndex = normalizeIndex(currentCategoryIndexRef.current + direction, length);
      const targetDisplay = displayIndexRef.current + direction;
      currentCategoryIndexRef.current = nextIndex;

      animateDisplayIndex(targetDisplay, 280, () => {
        currentCategoryIndexRef.current = nextIndex;
      });
    },
    [animateDisplayIndex, length],
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (animationRef.current !== null) return;
    const now = Date.now();
    if (now < nextWheelAllowedAtRef.current) return;
    if (event.deltaY === 0) return;

    const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
    // One accepted wheel event -> exactly one category step.
    nextWheelAllowedAtRef.current = now + 360;
    stepCarousel(direction);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div onWheel={handleWheel} className="absolute left-[288px] top-[27px] h-[215px] w-[1440px] select-none">
      <svg
        aria-hidden
        viewBox="0 0 1440 215"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      >
        <defs>
          <filter id="categories-arc-glow-soft" x="-65%" y="-170%" width="230%" height="440%">
            <feGaussianBlur stdDeviation="72" />
          </filter>
          <filter id="categories-arc-glow-core" x="-55%" y="-145%" width="210%" height="390%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
          <linearGradient
            id="categories-arc-glow-gradient"
            x1={ARC_CENTER_X - ARC_GLOW_HORIZONTAL_RADIUS}
            y1="0"
            x2={ARC_CENTER_X + ARC_GLOW_HORIZONTAL_RADIUS}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C8FF00" stopOpacity="0" />
            <stop offset="16%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#C8FF00" stopOpacity="0.46" />
            <stop offset="84%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="156"
          strokeLinecap="round"
          opacity="0.2"
          filter="url(#categories-arc-glow-soft)"
        />
        <path
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="88"
          strokeLinecap="round"
          opacity="0.34"
          filter="url(#categories-arc-glow-core)"
        />
      </svg>

      {categoryItems.map((item, index) => {
        const distance = getWrappedDistanceFloat(index, displayIndex, length);
        const maxVisibleDistance = 4;
        const distanceFactor = Math.min(1, Math.abs(distance) / maxVisibleDistance);
        const isFar = Math.abs(distance) > maxVisibleDistance + 0.05;

        const angle = distance * ARC_ANGLE_STEP;
        const rad = (angle * Math.PI) / 180;
        const x = ARC_CENTER_X + Math.sin(rad) * ARC_HORIZONTAL_RADIUS;
        const y = ARC_BASE_Y - Math.cos(rad) * ARC_VERTICAL_RADIUS;
        const scale = 1 - distanceFactor * 0.42;
        const iconSize = 102 - distanceFactor * 64;
        const opacity = isFar ? 0 : 1 - distanceFactor * 0.5;
        const isActive = Math.abs(distance) < 0.05;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goToIndex(index)}
            aria-label={item.label}
            aria-current={isActive ? "true" : undefined}
            className="group absolute flex flex-col items-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none active:outline-none"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translateX(-50%) scale(${scale})`,
              opacity,
              zIndex: 20 - Math.abs(distance),
              pointerEvents: isFar ? "none" : "auto",
              WebkitAppearance: "none",
              appearance: "none",
            }}
          >
            <img
              src={getCategoryIconSrc(item.icon)}
              alt=""
              draggable={false}
              className={`pointer-events-none object-contain transition-[filter,transform] duration-300 ${
                isActive
                  ? "drop-shadow-[0_10px_24px_rgba(200,255,0,0.35)]"
                  : "drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] group-hover:brightness-110"
              }`}
              style={{
                height: `${iconSize}px`,
                width: `${iconSize}px`,
              }}
            />
            <span
              className={`mt-[8px] text-center font-semibold tracking-[-0.002em] text-white transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-80"
              }`}
              style={{ fontSize: `${Math.max(10, 14 - distanceFactor * 6)}px` }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function HomeTopBlock() {
  const [mode, setMode] = useState<Mode>("exchange");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [hasDocuments, setHasDocuments] = useState(false);
  const [condition, setCondition] = useState("Отличное");
  const recommendationsRef = useRef<HTMLDivElement | null>(null);
  const currentRecommendationIndexRef = useRef(0);
  const wheelLockRef = useRef(false);
  const lastWheelAtRef = useRef(0);
  const unlockTimeoutRef = useRef<number | null>(null);

  const isExchange = mode === "exchange";
  const panelTitle = isExchange ? "Что хотите обменять?" : "Помогите узнать вас больше";
  const panelSubTitle = "Можно ввести не все поля";
  const titleLabel = isExchange ? "Название" : "Название желания";

  const topTabs = useMemo(
    () => [
      { id: "exchange" as const, label: "Хочу обменять" },
      { id: "browse" as const, label: "Хочу посмотреть" },
      { id: "all" as const, label: "Хочу все" },
    ],
    [],
  );

  const scrollToRecommendation = (targetIndex: number) => {
    const container = recommendationsRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>("[data-recommendation-card]");
    if (cards.length === 0) return;
    const nextIndex = Math.max(0, Math.min(cards.length - 1, targetIndex));
    currentRecommendationIndexRef.current = nextIndex;
    cards[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleRecommendationsWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    lastWheelAtRef.current = Date.now();

    if (wheelLockRef.current) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const nextIndex = currentRecommendationIndexRef.current + direction;

    wheelLockRef.current = true;
    scrollToRecommendation(nextIndex);
    const PAUSE_MS = 320;
    const MIN_LOCK_MS = 800;
    const startedAt = Date.now();

    const tryUnlock = () => {
      const now = Date.now();
      const enoughPause = now - lastWheelAtRef.current >= PAUSE_MS;
      const minLockPassed = now - startedAt >= MIN_LOCK_MS;

      if (enoughPause && minLockPassed) {
        wheelLockRef.current = false;
        unlockTimeoutRef.current = null;
        return;
      }

      unlockTimeoutRef.current = window.setTimeout(tryUnlock, 80);
    };

    unlockTimeoutRef.current = window.setTimeout(tryUnlock, 80);
  };

  useEffect(() => {
    const container = recommendationsRef.current;
    if (!container) return;
    const firstCard = container.querySelector<HTMLElement>("[data-recommendation-card]");
    if (!firstCard) return;
    firstCard.scrollIntoView({ block: "center" });
    currentRecommendationIndexRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen w-screen overflow-x-hidden bg-[#1A1A1A] text-white">
      <div className="relative left-1/2 h-[1330px] w-[1920px] -translate-x-1/2">
        <div className="absolute left-[239px] top-0 w-[1441px]">
          <Header />

          <section className="relative h-[1280px] w-[2011px] -translate-x-[285px]">
            <CategoriesArc />

            <h1 className="absolute left-[492px] top-[350px] w-[579px] text-[40px] font-bold leading-[40px]">
              Обменивайтесь <span className="text-[#8E8BED]">без продаж</span> и лишних переговоров
            </h1>

            <div className="absolute left-[1065px] top-[354px] flex gap-[12px]">
              {topTabs.map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    className={`flex h-[76px] w-[143px] flex-col items-center justify-center gap-[4px] rounded-[10px] border border-[0.5px] px-[24px] py-[12px] text-[14px] font-semibold transition ${
                      active
                        ? "border-[#F8F8F5] bg-[#8E8BED] text-white"
                        : "border-white bg-[#1A1A1A] text-white hover:bg-[#252525]"
                    }`}
                  >
                    <span className="flex h-[17px] items-center justify-center">{renderTabIcon(tab.id, active)}</span>
                    <span className="leading-[1.2]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute left-[492px] top-[486px] z-10 flex h-[535px] w-[1026px] gap-[12px]">
              {isExchange ? (
                <div className="flex h-full w-[560px] flex-col gap-[12px]">
                  <div className="h-[340px] rounded-[10px] border border-[#CACACA] bg-[#C8FF00] px-[24px] pt-[24px] text-[#3D3D3D]">
                    <h2 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px]">{panelTitle}</h2>
                    <p className="mt-[6px] text-[12px]">{panelSubTitle}</p>

                    <label className="mt-[16px] block text-[14px] font-semibold">{titleLabel}</label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={titlePlaceholder}
                      className={`mt-[8px] h-[83px] w-full text-[18px] leading-[1.2] tracking-[-0.2px] ${fieldClassName}`}
                    />

                    <div className="mt-[14px] flex gap-[12px]">
                      <div className="w-[177px]">
                        <label className="text-[14px] font-semibold">Примерная стоимость</label>
                        <input
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder={pricePlaceholder}
                          className={`mt-[8px] h-[48px] w-full text-[14px] ${fieldClassName}`}
                        />
                      </div>
                      <div className="relative w-[203px]">
                        <label className="text-[14px] font-semibold">Город</label>
                        <select
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          className={`mt-[8px] h-[48px] w-full appearance-none text-[14px] ${fieldClassName} ${city ? "" : "text-[#626262]"}`}
                        >
                          <option value="" disabled hidden>
                            {cityPlaceholder}
                          </option>
                          {cityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-[12px] top-[43px] text-[12px] text-[#3D3D3D]">▼</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-[183px] flex-col justify-center rounded-[10px] border border-[#CACACA] bg-[#F2F4F7] pl-[36px] pr-[24px]">
                    <p className="max-w-[330px] text-[14px] leading-[1.36] text-[#3D3D3D]">
                      Вся информация сохранится для будущего создания объявления
                    </p>
                    <button
                      type="button"
                      className="mt-[16px] flex h-[49px] w-fit items-center gap-[15px] rounded-[10px] bg-[#8E8BED] px-[24px] text-white"
                    >
                      <span className="text-[24px] font-extrabold leading-none">+</span>
                      <span className="text-[14px] font-semibold">Добавить объявление</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-[560px] rounded-[10px] border border-[#CACACA] bg-[#C8FF00] px-[24px] pt-[24px] pb-[24px] text-[#3D3D3D]">
                  <h2 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px]">{panelTitle}</h2>
                  <p className="mt-[6px] text-[12px]">{panelSubTitle}</p>

                  <label className="mt-[16px] block text-[14px] font-semibold">{titleLabel}</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={titlePlaceholder}
                    className={`mt-[8px] h-[83px] w-full text-[18px] leading-[1.2] tracking-[-0.2px] ${fieldClassName}`}
                  />

                  <div className="mt-[14px] flex gap-[12px]">
                    <div className="w-[177px]">
                      <label className="text-[14px] font-semibold">Примерная стоимость</label>
                      <input
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder={pricePlaceholder}
                        className={`mt-[8px] h-[48px] w-full text-[14px] ${fieldClassName}`}
                      />
                    </div>
                    <div className="relative w-[203px]">
                      <label className="text-[14px] font-semibold">Город</label>
                      <select
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className={`mt-[8px] h-[48px] w-full appearance-none text-[14px] ${fieldClassName} ${city ? "" : "text-[#626262]"}`}
                      >
                        <option value="" disabled hidden>
                          {cityPlaceholder}
                        </option>
                        {cityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-[12px] top-[43px] text-[12px] text-[#3D3D3D]">▼</span>
                    </div>
                  </div>

                  <label className="mt-[32px] flex cursor-pointer items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => setHasDocuments((prev) => !prev)}
                      className="relative h-[22px] w-[38px] rounded-[11px] border border-[#1A1A1A] bg-white p-[2px]"
                      aria-label="С документами"
                    >
                      <span
                        className={`block h-[16px] w-[16px] rounded-full bg-[#1A1A1A] transition-transform ${
                          hasDocuments ? "translate-x-[16px]" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[16px] leading-[24px] tracking-[0.16px] text-[#1A1A1A]">С документами</span>
                  </label>

                  <p className="mt-[32px] text-[14px] font-semibold">Выберите интересующее состояние</p>
                  <div className="mt-[8px] flex flex-wrap gap-[8px]">
                    {conditionOptions.map((item) => {
                      const active = condition === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCondition(item)}
                          className={`rounded-[16px] border px-[12px] py-[8px] text-[12px] font-medium ${
                            active
                              ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                              : "border-[#CACACA] bg-white text-[#1A1A1A]"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative h-full w-[454px] rounded-[10px] bg-[#C8FF00] p-[8px]">
                <p className="mx-auto mb-[8px] mt-[8px] w-[342px] text-left text-[16px] font-bold text-[#1A1A1A]">Вам может подойти</p>
                <div
                  ref={recommendationsRef}
                  onWheel={handleRecommendationsWheel}
                  className="mx-auto h-[479px] w-[358px] overflow-y-auto rounded-[10px] bg-[#F2F4F7] p-[8px] snap-y snap-mandatory overscroll-contain"
                >
                  <div className="flex flex-col items-center gap-[16px]">
                    {recommendedCards.map((card) => (
                      <div key={card.id} data-recommendation-card className="flex w-full snap-center snap-always justify-center">
                        <HeroCard />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <CenterExchangeBadge />
            </div>

            <p className="pointer-events-none absolute left-1/2 top-[1084px] z-20 w-max -translate-x-1/2 text-center text-[24px] font-extrabold leading-[32px] tracking-[-0.072px] text-white">
              Почему <span className="text-[#8E8BED]">Aimena</span>?
            </p>

            <TickerCarousel />
          </section>
        </div>

        <button className="absolute left-[1704px] top-[1024px] z-20 h-[67px] w-[72px]">
          <ChatBubbleIcon className="h-full w-full text-[#1A1A1A]" aria-label="Чат" />
        </button>
      </div>
    </main>
  );
}
