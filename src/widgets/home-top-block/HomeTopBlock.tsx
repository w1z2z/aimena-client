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
      <div className="relative left-1/2 h-[1119px] w-[1920px] -translate-x-1/2">
        <div className="absolute left-[239px] top-0 w-[1441px]">
          <Header />

          <section className="relative h-[1065px] w-[2011px] -translate-x-[285px]">
            <div className="absolute left-[288px] top-[27px] flex w-[1440px] items-start justify-between text-center text-[11px] text-white/70">
              {["Коллекция", "Животные", "Даром", "Электроника", "ВСЕ", "Одежда", "Для дома", "Хобби", "Транспорт"].map((i) => (
                <span key={i}>{i}</span>
              ))}
            </div>

            <h1 className="absolute left-[492px] top-[203px] w-[579px] text-[40px] font-bold leading-[40px]">
              Обменивайтесь <span className="text-[#8E8BED]">без продаж</span> и лишних переговоров
            </h1>

            <div className="absolute left-[1065px] top-[207px] flex gap-[12px]">
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

            <div className="absolute left-[492px] top-[339px] flex h-[535px] w-[1026px] gap-[12px]">
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

            <p className="absolute left-[863px] top-[937px] text-[22px] font-bold leading-[1.2]">Почему Aimena?</p>

            <div className="absolute left-[-96px] top-[981px] flex h-[34px] w-[2118px] items-center gap-[12px] overflow-hidden">
              {[...tickerItems, ...tickerItems].map((item, idx) => (
                <div key={`${item}-${idx}`} className="flex items-center gap-[12px] whitespace-nowrap rounded-[16.327px] px-[18px] py-[8px] text-[14px] font-semibold text-white">
                  <span>{item}</span>
                  <BoltIcon className="h-[22px] w-[13px]" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="absolute left-[1704px] top-[877px] h-[67px] w-[72px]">
          <ChatBubbleIcon className="h-full w-full text-[#1A1A1A]" aria-label="Чат" />
        </button>
      </div>
    </main>
  );
}
