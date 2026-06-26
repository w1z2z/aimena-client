/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  BoltIcon,
  categoryItems,
  getCategoryIconSrc,
  ExchangeBadgeIcon,
  TagsIcon,
  WantAllIcon,
  WantBrowseIcon,
  WantExchangeIcon,
} from "@/shared/ui/icons";
import { HERO_CONDITION_OPTIONS, useHomeSearch } from "@/features/home-search";
import type { MockListing } from "@/features/home-search/mock-listings";
import type { CategoryId } from "@/shared/ui/icons/category-icons";
import { SelectField } from "@/shared/ui/select-field";
import { Header } from "@/widgets/header/Header";

const imgHeroCard = "https://www.figma.com/api/mcp/asset/03e5747b-db77-495a-a0bc-3d74a40d9e94";

type Mode = "exchange" | "browse" | "all";

const cityOptions = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"];
const cityComboboxOptions = cityOptions.map((city) => ({ value: city, label: city }));
const conditionOptions = [...HERO_CONDITION_OPTIONS];

const titlePlaceholder = 'MacBook Pro 14" M3 Pro';
const pricePlaceholder = "~ 100 000р";
const cityPlaceholder = "Краснодар";
const BASE_SCENE_WIDTH = 1920;
const HERO_CONTENT_SHIFT_UP = 99;
const BASE_SCENE_HEIGHT = 1330 - HERO_CONTENT_SHIFT_UP;

const fieldClassName =
  "rounded-[10px] border border-[#CACACA] bg-white px-[12px] font-semibold text-[#3D3D3D] outline-none placeholder:text-[#626262]";

const MODE_COLORED_HEIGHT_EXCHANGE = 340;
const MODE_COLORED_HEIGHT_BROWSE = 535;
const MODE_WHITE_PANEL_HEIGHT = 183;
const MODE_PANEL_GAP = 12;
const MODE_PANEL_DURATION = 680;

function isSafariBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Zen/i.test(ua);
}

function useIsSafari() {
  return useSyncExternalStore(
    () => () => {},
    isSafariBrowser,
    () => false,
  );
}

function easeOutQuint(progress: number) {
  return 1 - (1 - progress) ** 5;
}

function useSafariPanelAnimation(
  isExchange: boolean,
  columnRef: RefObject<HTMLDivElement | null>,
  coloredRef: RefObject<HTMLDivElement | null>,
  whiteRef: RefObject<HTMLDivElement | null>,
) {
  const isSafari = useIsSafari();
  const animationRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  useLayoutEffect(() => {
    if (!isSafari) return;

    const column = columnRef.current;
    const colored = coloredRef.current;
    const white = whiteRef.current;
    if (!column || !colored || !white) return;

    const targetColored = isExchange ? MODE_COLORED_HEIGHT_EXCHANGE : MODE_COLORED_HEIGHT_BROWSE;
    const targetWhite = isExchange ? MODE_WHITE_PANEL_HEIGHT : 0;
    const targetGap = isExchange ? MODE_PANEL_GAP : 0;
    const targetWhiteOpacity = isExchange ? 1 : 0;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      colored.style.height = `${targetColored}px`;
      white.style.height = `${targetWhite}px`;
      column.style.gap = `${targetGap}px`;
      white.style.opacity = String(targetWhiteOpacity);
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startColored = colored.getBoundingClientRect().height;
    const startWhite = white.getBoundingClientRect().height;
    const startGap = Number.parseFloat(getComputedStyle(column).rowGap || getComputedStyle(column).gap) || 0;
    const startWhiteOpacity = Number.parseFloat(getComputedStyle(white).opacity) || 0;
    const startTime = performance.now();

    colored.style.transition = "none";
    white.style.transition = "none";
    column.style.transition = "none";

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / MODE_PANEL_DURATION);
      const eased = easeOutQuint(progress);

      colored.style.height = `${startColored + (targetColored - startColored) * eased}px`;
      white.style.height = `${startWhite + (targetWhite - startWhite) * eased}px`;
      column.style.gap = `${startGap + (targetGap - startGap) * eased}px`;
      white.style.opacity = String(startWhiteOpacity + (targetWhiteOpacity - startWhiteOpacity) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      colored.style.height = `${targetColored}px`;
      white.style.height = `${targetWhite}px`;
      column.style.gap = `${targetGap}px`;
      white.style.opacity = String(targetWhiteOpacity);
      colored.style.transition = "";
      white.style.transition = "";
      column.style.transition = "";
      animationRef.current = null;
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [coloredRef, columnRef, isExchange, isSafari, whiteRef]);
}

type ModeFormFieldsProps = {
  title: string;
  setTitle: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  hasDocuments: boolean;
  setHasDocuments: (value: boolean | ((prev: boolean) => boolean)) => void;
  condition: string;
  setCondition: (value: string) => void;
};

function PriceCityFields({
  price,
  setPrice,
  city,
  setCity,
}: Pick<ModeFormFieldsProps, "price" | "setPrice" | "city" | "setCity">) {
  return (
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
      <div className="w-[203px]">
        <label className="text-[14px] font-semibold">Город</label>
        <SelectField
          value={city}
          onChange={setCity}
          options={cityComboboxOptions}
          placeholder={cityPlaceholder}
          variant="hero"
          allowCustomValue
          className="mt-[8px]"
          aria-label="Город"
        />
      </div>
    </div>
  );
}

function ModeCrossfadeText({
  activeIndex,
  items,
  className,
}: {
  activeIndex: 0 | 1;
  items: [React.ReactNode, React.ReactNode];
  className?: string;
}) {
  return (
    <div className={`home-mode-crossfade-text ${className ?? ""}`}>
      {items.map((item, index) => (
        <span key={index} className={activeIndex === index ? "is-active" : undefined} aria-hidden={activeIndex !== index}>
          {item}
        </span>
      ))}
    </div>
  );
}

function BrowseOnlyFields({
  isExchange,
  hasDocuments,
  setHasDocuments,
  condition,
  setCondition,
}: Pick<ModeFormFieldsProps, "hasDocuments" | "setHasDocuments" | "condition" | "setCondition"> & {
  isExchange: boolean;
}) {
  return (
    <div className={`home-mode-browse-only ${isExchange ? "" : "is-visible"}`} aria-hidden={isExchange}>
      <label className="flex cursor-pointer items-center gap-[12px]">
        <button
          type="button"
          onClick={() => setHasDocuments((prev) => !prev)}
          className="relative h-[22px] w-[38px] rounded-[11px] border border-[#1A1A1A] bg-white p-[2px]"
          aria-label="С документами"
          tabIndex={isExchange ? -1 : 0}
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
              tabIndex={isExchange ? -1 : 0}
              className={`rounded-[16px] border px-[12px] py-[8px] text-[12px] font-medium ${
                active ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#CACACA] bg-white text-[#1A1A1A]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColoredPanelContent({ isExchange, title, setTitle, price, setPrice, city, setCity, ...browseFields }: ModeFormFieldsProps & { isExchange: boolean }) {
  const textIndex: 0 | 1 = isExchange ? 0 : 1;

  return (
    <>
      <ModeCrossfadeText
        activeIndex={textIndex}
        className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px]"
        items={["Что хотите обменять?", "Помогите узнать вас больше"]}
      />
      <p className="mt-[6px] text-[12px]">Можно ввести не все поля</p>

      <ModeCrossfadeText
        activeIndex={textIndex}
        className="mt-[16px] block text-[14px] font-semibold"
        items={["Название", "Название желания"]}
      />
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={titlePlaceholder}
        className={`mt-[8px] h-[83px] w-full text-[18px] leading-[1.2] tracking-[-0.2px] ${fieldClassName}`}
      />

      <PriceCityFields price={price} setPrice={setPrice} city={city} setCity={setCity} />

      <BrowseOnlyFields isExchange={isExchange} {...browseFields} />
    </>
  );
}

function ModeFormColumn({ isExchange, ...fields }: ModeFormFieldsProps & { isExchange: boolean }) {
  const isSafari = useIsSafari();
  const columnRef = useRef<HTMLDivElement>(null);
  const coloredRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);

  useSafariPanelAnimation(isExchange, columnRef, coloredRef, whiteRef);

  return (
    <div
      ref={columnRef}
      className={`home-mode-panel-column flex h-[535px] w-[560px] flex-col ${isExchange ? "is-exchange" : "is-browse"} ${isSafari ? "is-safari" : ""}`}
    >
      <div
        ref={coloredRef}
        className="home-mode-colored-panel shrink-0 overflow-hidden rounded-[10px] border border-[#CACACA] bg-[#C8FF00] px-[24px] pt-[24px] pb-[24px] text-[#3D3D3D]"
      >
        <ColoredPanelContent isExchange={isExchange} {...fields} />
      </div>

      <div ref={whiteRef} className="home-mode-white-panel shrink-0 overflow-hidden" aria-hidden={!isExchange}>
        <div className="flex h-[183px] flex-col justify-center rounded-[10px] border border-[#CACACA] bg-[#F2F4F7] pl-[36px] pr-[24px]">
          <p className="max-w-[330px] text-[14px] leading-[1.36] text-[#3D3D3D]">
            Вся информация сохранится для будущего создания объявления
          </p>
          <button
            type="button"
            tabIndex={isExchange ? 0 : -1}
            className="mt-[16px] flex h-[49px] w-fit items-center gap-[15px] rounded-[10px] bg-[#8E8BED] px-[24px] text-white"
          >
            <span className="text-[24px] font-extrabold leading-none">+</span>
            <span className="text-[14px] font-semibold">Добавить объявление</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function renderTabIcon(tabId: Mode, active: boolean) {
  if (tabId === "exchange") return <WantExchangeIcon active={active} className="h-[17px] w-[15px]" />;
  if (tabId === "browse") return <WantBrowseIcon active={active} className="h-4 w-4" />;
  return <WantAllIcon active={active} className="h-4 w-4" />;
}

function HeroCard({ listing }: { listing: MockListing }) {
  return (
    <div className="w-[342px] rounded-[10px] bg-white py-[12px] shadow-[0px_5px_4.95px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex h-[29px] w-[318px] items-center justify-center rounded-t-[10px] text-[18px] font-semibold text-[#1A1A1A]">
        {listing.title}
      </div>
      <div className="relative mt-[12px] h-[342px] w-[342px] overflow-hidden">
        <img src={imgHeroCard} alt="" className="h-full w-full object-cover" />
        <div className="absolute bottom-[9px] left-[8px] flex gap-[6px]">
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            {listing.city}
          </span>
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            {listing.condition}
          </span>
        </div>
      </div>
      <div className="mx-auto mt-[12px] flex min-h-[44px] w-[321px] items-center gap-[6px] rounded-[9px] border border-[#8E8BED] border-[0.3px] bg-[#F9F7FF] px-[8px]">
        <TagsIcon className="h-[11px] w-[11px] rotate-180 text-[#8E8BED]" />
        {listing.wants.map((item) => (
          <span
            key={item}
            className="rounded-[39px] border border-[#8E8BED] border-[0.5px] bg-[#F2F4F7] px-[8px] py-[4px] text-[11px] font-semibold text-[#1A1A1A]"
          >
            {item}
          </span>
        ))}
        {listing.wantsMore > 0 ? (
          <span className="text-[11px] text-[#626262]">+{listing.wantsMore}</span>
        ) : null}
      </div>
    </div>
  );
}

function CenterExchangeBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Открыть полный список объявлений по выбранной категории и параметрам"
      className="home-exchange-badge absolute bottom-[20.19%] left-[46.3%] right-[37.82%] top-[49.35%] cursor-pointer rounded-full border-0 bg-transparent p-0 transition-shadow duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.36)]"
    >
      <div className="home-exchange-badge__glass glass-surface relative h-full w-full overflow-hidden rounded-full">
        <svg viewBox="0 0 163 163" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <ellipse cx="81.5" cy="81" rx="71" ry="71" fill="none" stroke="#CACACA" strokeWidth="2.5" />
        </svg>
        <div className="pointer-events-none absolute left-[53px] top-[31px] h-[48.45px] w-[58.45px]">
          <ExchangeBadgeIcon className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-[55.64%_19.02%_24.73%_20.86%] flex items-center justify-center text-center text-[16px] font-bold leading-[20px] tracking-[0.001em] text-white">
          Все варианты
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
      <BoltIcon className="h-[22.443px] w-[13.466px] rotate-[15deg]" />
    </span>
  );
}

function TickerCarousel() {
  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div
      className="home-ticker-carousel pointer-events-none absolute left-1/2 z-20 h-[34px] overflow-hidden"
      style={{
        top: `${1172 - HERO_CONTENT_SHIFT_UP}px`,
        width: `${BASE_SCENE_WIDTH}px`,
        transform: "translateX(-50%) translateZ(0)",
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

function rebaseDisplayIndexContinuous(displayIndex: number, length: number) {
  const nearest = Math.round(displayIndex);
  const settled = normalizeIndex(nearest, length);
  const fraction = displayIndex - nearest;
  return settled + fraction;
}

const ARC_CENTER_X = 720;
const ARC_HORIZONTAL_RADIUS = 620;
const ARC_VERTICAL_RADIUS = 170;
const ARC_BASE_Y = 218;
const ARC_CONTAINER_TOP = -20;
const ARC_CONTAINER_HEIGHT = 188;
const ARC_ACTIVE_ICON_SIZE = 102;
const ARC_GLOW_HORIZONTAL_RADIUS = 735;
const ARC_ANGLE_STEP = 17.5;
const ARC_ACTIVE_ICON_CENTER_Y = ARC_BASE_Y - ARC_VERTICAL_RADIUS + ARC_ACTIVE_ICON_SIZE / 2;
const ARC_GLOW_BASE_Y = ARC_ACTIVE_ICON_CENTER_Y + ARC_VERTICAL_RADIUS;
const ARC_GLOW_PATH = `M ${ARC_CENTER_X - ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y} A ${ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_VERTICAL_RADIUS} 0 0 1 ${ARC_CENTER_X + ARC_GLOW_HORIZONTAL_RADIUS} ${ARC_GLOW_BASE_Y}`;
const CATEGORY_DRAG_CLICK_THRESHOLD = 6;
const CATEGORY_DRAG_PIXELS_PER_STEP = 88;
const CATEGORY_ACTIVE_SCALE_BOOST = 0.05;
const CATEGORY_ACTIVE_SIZE_BOOST = 6;
const CATEGORY_ACTIVE_LABEL_BOOST = 1;

const CATEGORY_ICON_ACTIVE_SHADOW = "drop-shadow(0 10px 24px rgba(200, 255, 0, 0.35))";
const CATEGORY_ICON_INACTIVE_SHADOW = "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35))";

function getCategoryIconFilter(isActive: boolean, useSvgFilter: boolean) {
  if (useSvgFilter) {
    return isActive ? "url(#category-icon-shadow-active)" : "url(#category-icon-shadow-inactive)";
  }

  return isActive ? CATEGORY_ICON_ACTIVE_SHADOW : CATEGORY_ICON_INACTIVE_SHADOW;
}

type CategoryLayout = {
  x: number;
  y: number;
  scale: number;
  iconSize: number;
  opacity: number;
  isFar: boolean;
  isActive: boolean;
  labelSize: number;
  labelOpacity: number;
};

function computeCategoryLayout(index: number, displayIndex: number, length: number): CategoryLayout {
  const distance = getWrappedDistanceFloat(index, displayIndex, length);
  const maxVisibleDistance = 4;
  const distanceFactor = Math.min(1, Math.abs(distance) / maxVisibleDistance);
  const isFar = Math.abs(distance) > maxVisibleDistance + 0.05;
  const angle = distance * ARC_ANGLE_STEP;
  const rad = (angle * Math.PI) / 180;
  const centerProximity = Math.max(0, 1 - Math.abs(distance) / 0.45);
  const scale = 1 - distanceFactor * 0.42 + centerProximity * CATEGORY_ACTIVE_SCALE_BOOST;
  const iconSize = 102 - distanceFactor * 64 + centerProximity * CATEGORY_ACTIVE_SIZE_BOOST;
  const arcTopY = ARC_BASE_Y - Math.cos(rad) * ARC_VERTICAL_RADIUS;
  const scaledIconHeight = iconSize * scale;

  return {
    x: ARC_CENTER_X + Math.sin(rad) * ARC_HORIZONTAL_RADIUS,
    y: arcTopY - (scaledIconHeight - ARC_ACTIVE_ICON_SIZE) / 2,
    scale,
    iconSize,
    opacity: isFar ? 0 : 1 - distanceFactor * 0.5,
    isFar,
    isActive: Math.abs(distance) < 0.05,
    labelSize: Math.max(10, 14 - distanceFactor * 6) + centerProximity * CATEGORY_ACTIVE_LABEL_BOOST,
    labelOpacity: Math.abs(distance) < 0.05 ? 1 : 0.8,
  };
}

type CategoryItemRefs = {
  button: HTMLButtonElement;
  iconWrap: HTMLElement;
  img: HTMLImageElement;
  label: HTMLElement;
};

function applyCategoryLayout(
  refs: CategoryItemRefs,
  layout: CategoryLayout,
  useSvgIconFilter: boolean,
  options?: { skipFilters?: boolean; skipAria?: boolean },
) {
  const { button, iconWrap, img, label } = refs;
  const skipFilters = options?.skipFilters ?? false;
  const skipAria = options?.skipAria ?? false;

  button.style.left = `${layout.x}px`;
  button.style.top = `${layout.y}px`;
  button.style.transform = "translateX(-50%)";
  button.style.opacity = String(layout.opacity);
  button.style.pointerEvents = layout.isFar ? "none" : "auto";

  iconWrap.style.transform = `scale(${layout.scale})`;
  iconWrap.style.transformOrigin = "top center";

  img.style.width = `${layout.iconSize}px`;
  img.style.height = `${layout.iconSize}px`;

  if (!skipFilters) {
    const filter = getCategoryIconFilter(layout.isActive, useSvgIconFilter);
    if (useSvgIconFilter) {
      img.style.filter = filter;
      img.style.webkitFilter = filter;
    } else {
      img.style.removeProperty("filter");
      img.style.removeProperty("-webkit-filter");
    }
  }

  label.style.fontSize = `${layout.labelSize}px`;
  label.style.opacity = String(layout.labelOpacity);

  if (!skipAria) {
    if (layout.isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  }
}

function CategoriesArc({ onCategoryChange }: { onCategoryChange?: (categoryId: CategoryId) => void }) {
  const initialIndex = Math.max(
    0,
    categoryItems.findIndex((item) => item.id === "all"),
  );
  const length = categoryItems.length;
  const displayIndexRef = useRef(initialIndex);
  const currentCategoryIndexRef = useRef(initialIndex);
  const itemRefs = useRef<(CategoryItemRefs | null)[]>([]);
  const useSvgIconFilterRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isSafari = useIsSafari();
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartDisplayIndexRef = useRef(0);
  const pendingTapIndexRef = useRef<number | null>(null);

  const applyAllLayouts = useCallback(
    (displayIndex: number, options?: { skipFilters?: boolean; skipAria?: boolean }) => {
      const skipFilters = options?.skipFilters ?? isAnimatingRef.current;
      const skipAria = options?.skipAria ?? isAnimatingRef.current;

      categoryItems.forEach((_, index) => {
        const refs = itemRefs.current[index];
        if (!refs) return;

        const layout = computeCategoryLayout(index, displayIndex, length);
        if (layout.isFar) {
          refs.button.style.opacity = "0";
          refs.button.style.pointerEvents = "none";
          return;
        }

        const distance = getWrappedDistanceFloat(index, displayIndex, length);
        refs.button.style.zIndex = String(20 - Math.abs(distance));
        applyCategoryLayout(refs, layout, useSvgIconFilterRef.current, { skipFilters, skipAria });
      });
    },
    [length],
  );

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

      isAnimatingRef.current = true;
      itemRefs.current.forEach((refs) => {
        if (refs) {
          refs.button.style.willChange = "transform, opacity";
          refs.iconWrap.style.willChange = "transform";
        }
      });

      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const current = from + delta * eased;

        displayIndexRef.current = current;
        applyAllLayouts(current, { skipFilters: true, skipAria: true });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
          return;
        }

        displayIndexRef.current = targetValue;
        isAnimatingRef.current = false;
        itemRefs.current.forEach((refs) => {
          if (refs) {
            refs.button.style.willChange = "auto";
            refs.iconWrap.style.willChange = "auto";
          }
        });
        applyAllLayouts(targetValue);
        animationRef.current = null;
        onComplete?.();
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [applyAllLayouts],
  );

  const notifyCategorySettled = useCallback(
    (settled: number) => {
      currentCategoryIndexRef.current = settled;
      displayIndexRef.current = settled;
      onCategoryChange?.(categoryItems[settled].id);
    },
    [onCategoryChange],
  );

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const settled = normalizeIndex(targetIndex, length);
      const from = displayIndexRef.current;
      const delta = getShortestDelta(from, settled, length);

      animateDisplayIndex(from + delta, Math.min(520, 260 + Math.abs(delta) * 70), () => {
        notifyCategorySettled(settled);
      });
    },
    [animateDisplayIndex, length, notifyCategorySettled],
  );

  const settleAfterDrag = useCallback(() => {
    const from = displayIndexRef.current;
    const targetDisplay = Math.round(from);
    const settled = normalizeIndex(targetDisplay, length);
    const delta = targetDisplay - from;

    if (Math.abs(delta) < 0.001) {
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
      return;
    }

    animateDisplayIndex(targetDisplay, Math.min(520, 260 + Math.abs(delta) * 70), () => {
      notifyCategorySettled(settled);
      applyAllLayouts(settled);
    });
  }, [animateDisplayIndex, applyAllLayouts, length, notifyCategorySettled]);

  const blurButtonAfterPointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

  const beginPointerTrack = useCallback((event: PointerEvent<HTMLElement>, tapIndex: number | null) => {
    if (event.button !== 0) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    pendingTapIndexRef.current = tapIndex;
    dragStartXRef.current = event.clientX;
    dragStartDisplayIndexRef.current = displayIndexRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handleTrackedPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - dragStartXRef.current;
      if (Math.abs(deltaX) <= CATEGORY_DRAG_CLICK_THRESHOLD) return;

      hasDraggedRef.current = true;
      pendingTapIndexRef.current = null;
      event.preventDefault();

      const nextDisplayIndex = dragStartDisplayIndexRef.current - deltaX / CATEGORY_DRAG_PIXELS_PER_STEP;
      const rebasedDisplayIndex =
        Math.abs(nextDisplayIndex) > length * 20
          ? rebaseDisplayIndexContinuous(nextDisplayIndex, length)
          : nextDisplayIndex;

      if (rebasedDisplayIndex !== nextDisplayIndex) {
        dragStartDisplayIndexRef.current += rebasedDisplayIndex - nextDisplayIndex;
      }

      displayIndexRef.current = rebasedDisplayIndex;
      applyAllLayouts(rebasedDisplayIndex, { skipFilters: true, skipAria: true });
    },
    [applyAllLayouts, length],
  );

  const endPointerTrack = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      isDraggingRef.current = false;

      if (hasDraggedRef.current) {
        settleAfterDrag();
        pendingTapIndexRef.current = null;
        return;
      }

      if (pendingTapIndexRef.current !== null) {
        goToIndex(pendingTapIndexRef.current);
        pendingTapIndexRef.current = null;
      }
    },
    [goToIndex, settleAfterDrag],
  );

  const handleContainerPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-category-button]")) return;
    beginPointerTrack(event, null);
  };

  useLayoutEffect(() => {
    useSvgIconFilterRef.current = isSafari;
    applyAllLayouts(displayIndexRef.current);
  }, [applyAllLayouts, isSafari]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  return (
    <div
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleTrackedPointerMove}
      onPointerUp={endPointerTrack}
      onPointerCancel={endPointerTrack}
      className="categories-arc absolute left-[288px] z-10 h-[188px] w-[1440px] cursor-grab select-none active:cursor-grabbing"
      style={{ top: `${ARC_CONTAINER_TOP}px` }}
    >
      <svg
        aria-hidden
        viewBox={`0 0 1440 ${ARC_CONTAINER_HEIGHT}`}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        style={
          isSafari
            ? {
                filter: "blur(44px)",
                WebkitFilter: "blur(44px)",
              }
            : undefined
        }
      >
        <defs>
          {!isSafari && (
            <>
              <filter
                id="categories-arc-glow-soft"
                x="-65%"
                y="-170%"
                width="230%"
                height="440%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="72" edgeMode="none" />
              </filter>
              <filter
                id="categories-arc-glow-core"
                x="-55%"
                y="-145%"
                width="210%"
                height="390%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="42" edgeMode="none" />
              </filter>
              <filter
                id="category-icon-shadow-active"
                x="-120%"
                y="-120%"
                width="340%"
                height="340%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgb(200, 255, 0)" floodOpacity="0.35" />
              </filter>
              <filter
                id="category-icon-shadow-inactive"
                x="-120%"
                y="-120%"
                width="340%"
                height="340%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="rgb(0, 0, 0)" floodOpacity="0.35" />
              </filter>
            </>
          )}
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
          className="categories-arc-glow"
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="156"
          strokeLinecap="round"
          opacity="0.2"
          filter={isSafari ? undefined : "url(#categories-arc-glow-soft)"}
        />
        <path
          className="categories-arc-glow"
          d={ARC_GLOW_PATH}
          fill="none"
          stroke="url(#categories-arc-glow-gradient)"
          strokeWidth="88"
          strokeLinecap="round"
          opacity="0.34"
          filter={isSafari ? undefined : "url(#categories-arc-glow-core)"}
        />
      </svg>

      {isSafari && (
        <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
          <defs>
            <filter
              id="category-icon-shadow-active"
              x="-120%"
              y="-120%"
              width="340%"
              height="340%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgb(200, 255, 0)" floodOpacity="0.35" />
            </filter>
            <filter
              id="category-icon-shadow-inactive"
              x="-120%"
              y="-120%"
              width="340%"
              height="340%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="rgb(0, 0, 0)" floodOpacity="0.35" />
            </filter>
          </defs>
        </svg>
      )}

      {categoryItems.map((item, index) => {
        const layout = computeCategoryLayout(index, initialIndex, length);
        const distance = getWrappedDistanceFloat(index, initialIndex, length);

        return (
          <button
            key={item.id}
            ref={(element) => {
              if (!element) {
                itemRefs.current[index] = null;
                return;
              }

              const iconWrap = element.querySelector<HTMLElement>("[data-category-icon-wrap]");
              const img = element.querySelector<HTMLImageElement>("[data-category-icon]");
              const label = element.querySelector<HTMLElement>("[data-category-label]");
              if (!iconWrap || !img || !label) return;

              itemRefs.current[index] = { button: element, iconWrap, img, label };
            }}
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
              beginPointerTrack(event, index);
            }}
            onPointerMove={handleTrackedPointerMove}
            onPointerUp={(event) => {
              endPointerTrack(event);
              blurButtonAfterPointer(event);
            }}
            onPointerCancel={(event) => {
              endPointerTrack(event);
              blurButtonAfterPointer(event);
            }}
            aria-label={item.label}
            aria-current={layout.isActive ? "true" : undefined}
            data-category-button
            className="group absolute flex flex-col items-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none"
            style={{
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              transform: "translateX(-50%)",
              opacity: layout.opacity,
              zIndex: 20 - Math.abs(distance),
              pointerEvents: layout.isFar ? "none" : "auto",
              WebkitAppearance: "none",
              appearance: "none",
            }}
          >
            <span
              data-category-icon-wrap
              className="inline-block origin-top"
              style={{ transform: `scale(${layout.scale})` }}
            >
              <img
                data-category-icon
                src={getCategoryIconSrc(item.icon)}
                alt=""
                draggable={false}
                className={`pointer-events-none object-contain group-hover:brightness-110 ${
                  layout.isActive
                    ? "drop-shadow-[0_10px_24px_rgba(200,255,0,0.35)]"
                    : "drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                }`}
                style={{
                  height: `${layout.iconSize}px`,
                  width: `${layout.iconSize}px`,
                }}
              />
            </span>
            <span
              data-category-label
              className="mt-[8px] text-center font-semibold tracking-[-0.002em] text-white"
              style={{ fontSize: `${layout.labelSize}px`, opacity: layout.labelOpacity }}
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
  const {
    hero,
    setMode,
    setCategoryId,
    setTitle,
    setPrice,
    setCity,
    setHasDocuments,
    setCondition,
    heroRecommendations,
    openFiltersAndScroll,
  } = useHomeSearch();
  const [sceneScale, setSceneScale] = useState(1);

  const { mode, title, price, city, hasDocuments, condition } = hero;
  const isExchange = mode === "exchange";
  const blurButtonAfterClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

  const handleCategoryChange = useCallback(
    (categoryId: CategoryId) => {
      setCategoryId(categoryId);
      setMode("browse");
    },
    [setCategoryId, setMode],
  );

  const topTabs = useMemo(
    () => [
      { id: "exchange" as const, label: "Хочу обменять" },
      { id: "browse" as const, label: "Хочу посмотреть" },
    ],
    [],
  );

  useEffect(() => {
    const applyScale = () => {
      const nextScale = Math.min(1, window.innerWidth / BASE_SCENE_WIDTH);
      setSceneScale(nextScale);
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    return () => {
      window.removeEventListener("resize", applyScale);
    };
  }, []);

  return (
    <div className="bg-[#1A1A1A] text-white">
      <Header />

      <div className="relative w-full overflow-hidden" style={{ height: `${BASE_SCENE_HEIGHT * sceneScale}px` }}>
        <div
          className="relative left-1/2 h-[1330px] w-[1920px] origin-top"
          style={{ transform: `translateX(-50%) scale(${sceneScale})` }}
        >
        <div className="absolute left-[239px] top-0 z-20 w-[1441px]">
          <div className="h-[54px]" aria-hidden="true" />

          <section
            className="relative w-[2011px] -translate-x-[285px]"
            style={{ height: `${1280 - HERO_CONTENT_SHIFT_UP}px` }}
          >
            <CategoriesArc onCategoryChange={handleCategoryChange} />

            <h1
              className="absolute left-[492px] w-[579px] text-[40px] font-bold leading-[40px]"
              style={{ top: `${350 - HERO_CONTENT_SHIFT_UP}px` }}
            >
              Обменивайтесь <span className="text-[#8E8BED]">без продаж</span> и лишних переговоров
            </h1>

            <div
              className="absolute left-[1065px] flex w-[453px] gap-[12px]"
              style={{ top: `${354 - HERO_CONTENT_SHIFT_UP}px` }}
            >
              {topTabs.map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(event) => {
                      setMode(tab.id);
                      blurButtonAfterClick(event);
                    }}
                    className={`flex h-[76px] flex-1 flex-col items-center justify-center gap-[4px] rounded-[10px] border border-[0.5px] px-[24px] py-[12px] text-[14px] font-semibold outline-none transition focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none ${
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

            <div
              className="absolute left-[492px] z-10 flex h-[535px] w-[1026px] gap-[12px]"
              style={{ top: `${486 - HERO_CONTENT_SHIFT_UP}px` }}
            >
              <ModeFormColumn
                isExchange={isExchange}
                title={title}
                setTitle={setTitle}
                price={price}
                setPrice={setPrice}
                city={city}
                setCity={setCity}
                hasDocuments={hasDocuments}
                setHasDocuments={setHasDocuments}
                condition={condition}
                setCondition={setCondition}
              />

              <div className="relative h-full w-[454px] rounded-[10px] bg-[#C8FF00] p-[8px]">
                <p className="mx-auto mb-[8px] mt-[8px] w-[342px] text-left text-[16px] font-bold text-[#1A1A1A]">Вам может подойти</p>
                <div
                  className="home-recommendations-scroll mx-auto h-[479px] w-[358px] overflow-y-auto overflow-x-hidden rounded-[10px] p-[8px] snap-y snap-mandatory overscroll-contain"
                >
                  <div className="flex flex-col items-center gap-[16px]">
                    {heroRecommendations.map((listing) => (
                      <div key={listing.id} data-recommendation-card className="flex w-full snap-center snap-always justify-center">
                        <HeroCard listing={listing} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <CenterExchangeBadge onClick={openFiltersAndScroll} />
            </div>

            <p
              className="pointer-events-none absolute left-1/2 z-20 w-max -translate-x-1/2 text-center text-[24px] font-extrabold leading-[32px] tracking-[-0.072px] text-white"
              style={{ top: `${1084 - HERO_CONTENT_SHIFT_UP}px` }}
            >
              Почему <span className="text-[#8E8BED]">Aimena</span>?
            </p>

            <TickerCarousel />
          </section>
        </div>

      </div>
      </div>
    </div>
  );
}
