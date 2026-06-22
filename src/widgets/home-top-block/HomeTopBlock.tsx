/* eslint-disable @next/next/no-img-element */
"use client";

import { type WheelEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  BoltIcon,
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
];

const topCategoryItems = [
  { id: "collection", label: "Коллекция", icon: "●" },
  { id: "animals", label: "Животные", icon: "●" },
  { id: "free", label: "Даром", icon: "●" },
  { id: "electronics", label: "Электроника", icon: "●" },
  { id: "all", label: "ВСЕ", icon: "●" },
  { id: "clothes", label: "Одежда", icon: "●" },
  { id: "home", label: "Для дома", icon: "●" },
  { id: "hobby", label: "Хобби", icon: "●" },
  { id: "transport", label: "Транспорт", icon: "●" },
] as const;

function normalizeIndex(index: number, length: number) {
  if (length <= 0) return 0;
  const result = index % length;
  return result < 0 ? result + length : result;
}

function getWrappedDistance(index: number, activeIndex: number, length: number) {
  const rawDistance = index - activeIndex;
  if (rawDistance > length / 2) return rawDistance - length;
  if (rawDistance < -length / 2) return rawDistance + length;
  return rawDistance;
}

function CategoriesArc() {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      topCategoryItems.findIndex((item) => item.id === "all"),
    ),
  );
  const wheelLockRef = useRef(false);
  const unlockTimeoutRef = useRef<number | null>(null);

  const shiftToNext = (direction: number) => {
    setActiveIndex((current) => normalizeIndex(current + direction, topCategoryItems.length));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (wheelLockRef.current) return;
    wheelLockRef.current = true;

    shiftToNext(event.deltaY > 0 ? 1 : -1);

    unlockTimeoutRef.current = window.setTimeout(() => {
      wheelLockRef.current = false;
      unlockTimeoutRef.current = null;
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div onWheel={handleWheel} className="absolute left-[288px] top-[27px] h-[215px] w-[1440px] select-none">
      <svg
        aria-hidden
        viewBox="0 0 1440 215"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <filter id="categories-arc-glow-soft" x="-65%" y="-170%" width="230%" height="440%">
            <feGaussianBlur stdDeviation="72" />
          </filter>
          <filter id="categories-arc-glow-core" x="-55%" y="-145%" width="210%" height="390%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
          <linearGradient id="categories-arc-glow-gradient" x1="8" y1="0" x2="1432" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C8FF00" stopOpacity="0" />
            <stop offset="16%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#C8FF00" stopOpacity="0.46" />
            <stop offset="84%" stopColor="#C8FF00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M 44 210 A 676 106 0 0 1 1396 210"
          fill="none"
          stroke="#8E8BED"
          strokeWidth="1.4"
          opacity="0.52"
        />
        <path
          d="M 8 210 A 712 112 0 0 1 1432 210"
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="156"
          strokeLinecap="round"
          opacity="0.2"
          filter="url(#categories-arc-glow-soft)"
        />
        <path
          d="M 8 210 A 712 112 0 0 1 1432 210"
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="88"
          strokeLinecap="round"
          opacity="0.34"
          filter="url(#categories-arc-glow-core)"
        />
      </svg>

      {topCategoryItems.map((item, index) => {
        const distance = getWrappedDistance(index, activeIndex, topCategoryItems.length);
        const maxVisibleDistance = 4;
        const hidden = Math.abs(distance) > maxVisibleDistance;

        if (hidden) {
          return null;
        }

        const angle = distance * 17.5;
        const rad = (angle * Math.PI) / 180;
        const x = 720 + Math.sin(rad) * 620;
        const y = 176 - Math.cos(rad) * 122;
        const distanceFactor = Math.abs(distance) / maxVisibleDistance;
        const scale = 1 - distanceFactor * 0.42;
        const iconSize = 92 - distanceFactor * 58;
        const opacity = 1 - distanceFactor * 0.5;
        const isActive = distance === 0;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={item.label}
            className="group absolute flex flex-col items-center transition-[transform,opacity] duration-500 ease-out"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translateX(-50%) scale(${scale})`,
              opacity,
              zIndex: 20 - Math.abs(distance),
            }}
          >
            <div
              className={`relative flex items-center justify-center rounded-full border border-white/30 text-white shadow-[0_12px_26px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                isActive
                  ? "bg-[#8E8BED] ring-2 ring-[#C8FF00]/90 ring-offset-2 ring-offset-[#1A1A1A]"
                  : "bg-[#2D2D2D]/90 group-hover:bg-[#393939]"
              }`}
              style={{
                height: `${iconSize}px`,
                width: `${iconSize}px`,
                fontSize: `${Math.max(18, iconSize * 0.32)}px`,
              }}
            >
              {item.icon}
            </div>
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

            <div className="absolute left-[492px] top-[486px] flex h-[535px] w-[1026px] gap-[12px]">
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

            <p className="absolute left-[863px] top-[1084px] text-[22px] font-bold leading-[1.2]">Почему Aimena?</p>

            <div className="absolute left-[-96px] top-[1128px] flex h-[34px] w-[2118px] items-center gap-[12px] overflow-hidden">
              {[...tickerItems, ...tickerItems].map((item, idx) => (
                <div key={`${item}-${idx}`} className="flex items-center gap-[12px] whitespace-nowrap rounded-[16.327px] px-[18px] py-[8px] text-[14px] font-semibold text-white">
                  <span>{item}</span>
                  <BoltIcon className="h-[22px] w-[13px]" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="absolute left-[1704px] top-[1024px] h-[67px] w-[72px]">
          <ChatBubbleIcon className="h-full w-full text-[#1A1A1A]" aria-label="Чат" />
        </button>
      </div>
    </main>
  );
}
