"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";

import { HERO_CONDITION_OPTIONS } from "@/entities/listing";
import { extractPriceDigits, formatPriceWithSpaces } from "@/shared/lib/format-price";
import { StarMiniIcon } from "@/shared/ui/icons";
import viewAllArrow from "@/shared/ui/icons/view-all-arrow.svg";
import type { SelectOption } from "@/shared/ui/select-field";
import { SelectField } from "@/shared/ui/select-field";

import { cityPlaceholder, titlePlaceholder, type Mode } from "./constants";

const serviceLevelOptions = ["Мастер", "Профессионал", "Специалист", "Новичок"] as const;
const serviceFormatOptions = ["Онлайн", "Офлайн", "С выездом"] as const;

/** Shared motion for nested listing-type swaps inside exchange filters. */
const HERO_SWAP_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const HERO_SWAP_DURATION = "duration-500";
const HERO_SWAP_TRANSITION = `transition-all ${HERO_SWAP_DURATION} ${HERO_SWAP_EASE}`;
const HERO_COLOR_TRANSITION = `transition-colors ${HERO_SWAP_DURATION} ${HERO_SWAP_EASE}`;
const HERO_TRANSFORM_TRANSITION = `transition-transform ${HERO_SWAP_DURATION} ${HERO_SWAP_EASE}`;

/** One continuous star split across the two lower panels (464 + 24 gap). */
const HERO_PANEL_STAR_SIZE = "h-[430px] w-[430px]";
const HERO_PANEL_STAR_TOP = "top-[98px]";
const HERO_PANEL_STAR_LEFT = "left-[290px]";
const HERO_PANEL_STAR_RIGHT = "left-[-198px]";

function HeroBackgroundStar({ className, gradientId }: { className: string; gradientId: string }) {
  return (
    <svg
      className={className}
      viewBox="-185 -9 399 399"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        opacity="0.72"
        d="M-28.1793 24.9278C-9.43279 -8.30915 38.4328 -8.30909 57.1794 24.9279L94.8807 91.7711C99.2704 99.554 105.705 105.988 113.488 110.378L180.331 148.079C213.568 166.826 213.568 214.692 180.331 233.438L113.488 271.139C105.705 275.529 99.2704 281.964 94.8806 289.747L57.1793 356.59C38.4328 389.827 -9.43282 389.827 -28.1793 356.59L-65.8806 289.746C-70.2704 281.964 -76.7048 275.529 -84.4877 271.139L-151.331 233.438C-184.568 214.692 -184.568 166.826 -151.331 148.079L-84.4877 110.378C-76.7048 105.988 -70.2704 99.554 -65.8806 91.7711L-28.1793 24.9278Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient id={gradientId} x1="-45.875" y1="94.1588" x2="50.4352" y2="220.512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HeroViewAllGlyph() {
  return (
    <svg viewBox="0 0 59 49" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <path
        d="M20.7853 3.12559C21.7949 1.6303 23.9964 1.63031 25.006 3.1256L29.2411 9.39801C29.4235 9.66828 29.6562 9.90099 29.9265 10.0835L36.1989 14.3185C37.6942 15.3281 37.6942 17.5296 36.1989 18.5392L29.9265 22.7743C29.6562 22.9567 29.4235 23.1895 29.2411 23.4597L25.006 29.7321C23.9964 31.2274 21.7949 31.2274 20.7853 29.7321L16.5503 23.4597C16.3678 23.1895 16.1351 22.9567 15.8648 22.7743L9.59239 18.5392C8.0971 17.5296 8.0971 15.3281 9.59239 14.3185L15.8648 10.0835C16.1351 9.90099 16.3678 9.66828 16.5503 9.39801L20.7853 3.12559Z"
        fill="#FFFFFF"
      />
      <path
        d="M40.3104 18.3258C41.3515 16.8523 43.5525 16.8991 44.5301 18.4155L48.6308 24.7765C48.8075 25.0506 49.0352 25.2882 49.3016 25.4764L55.4825 29.8439C56.956 30.885 56.9092 33.086 55.3928 34.0636L49.0318 38.1643C48.7577 38.341 48.5201 38.5688 48.3319 38.8351L43.9644 45.0161C42.9233 46.4895 40.7223 46.4427 39.7447 44.9263L35.644 38.5653C35.4673 38.2912 35.2396 38.0536 34.9732 37.8654L28.7923 33.498C27.3188 32.4568 27.3656 30.2558 28.882 29.2782L35.243 25.1775C35.5171 25.0008 35.7547 24.7731 35.9429 24.5067L40.3104 18.3258Z"
        fill="#FFFFFF"
      />
      <path d="M18.5791 41.8845L26.375 39.9995" stroke="#FFFFFF" strokeWidth="1.35362" strokeLinecap="round" />
      <path d="M0.67682 28.6822L8.23545 25.9998" stroke="#FFFFFF" strokeWidth="1.35362" strokeLinecap="round" />
      <path d="M24.3211 42.9705L32.6102 41.1874" stroke="#FFFFFF" strokeWidth="1.35362" strokeLinecap="round" />
      <path d="M6.49924 29.1655L14.559 26.5335" stroke="#FFFFFF" strokeWidth="1.35362" strokeLinecap="round" />
    </svg>
  );
}

function HeroViewAllArrow() {
  return (
    <img src={viewAllArrow.src} alt="" aria-hidden="true" className="h-full w-full" />
  );
}

export type ModeFormFieldsProps = {
  mode: Mode;
  setMode: (value: Mode) => void;
  title: string;
  setTitle: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  cityOptions: SelectOption[];
  onCityInputChange: (value: string) => void;
  onCityListEndReached: () => void;
  condition: string;
  setCondition: (value: string) => void;
  onViewAllClick: () => void;
};

function ModeHeading({ isExchange }: { isExchange: boolean }) {
  const exchangeWordRef = useRef<HTMLSpanElement>(null);
  const browseWordRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const activeNode = isExchange ? exchangeWordRef.current : browseWordRef.current;
    if (!activeNode) return;
    setWordWidth(activeNode.getBoundingClientRect().width);
  }, [isExchange]);

  return (
    <h2 className="whitespace-nowrap text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
      Что хотите{" "}
      <span className="hero-mode-word" style={wordWidth == null ? undefined : { width: `${wordWidth}px` }}>
        <span
          ref={exchangeWordRef}
          className={`hero-mode-title ${isExchange ? "is-active" : "is-hidden"}`}
        >
          <span className="text-[#8E8BED]">обменять</span>
          <span className="text-[#1A1A1A]">?</span>
        </span>
        <span
          ref={browseWordRef}
          className={`hero-mode-title ${!isExchange ? "is-active" : "is-hidden"}`}
        >
          <span className="text-[#8E8BED]">посмотреть</span>
          <span className="text-[#1A1A1A]">?</span>
        </span>
      </span>
    </h2>
  );
}

function TopModeToggle({ mode, setMode }: Pick<ModeFormFieldsProps, "mode" | "setMode">) {
  const tabs = [
    { id: "exchange" as const, label: "Хочу обменять" },
    { id: "browse" as const, label: "Хочу посмотреть" },
  ];

  return (
    <div className="relative box-border flex h-[70px] w-[346px] items-center gap-[4px] rounded-[21px] border-[0.5px] border-[#CACACA] bg-white p-[8px]">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[8px] left-[8px] top-[8px] w-[calc(50%-10px)] rounded-[17px] bg-[#8E8BED] ${HERO_TRANSFORM_TRANSITION} ${
          mode === "browse" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />
      {tabs.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (mode === tab.id) return;
              setMode(tab.id);
            }}
            className={`relative z-[1] flex h-full flex-1 items-center justify-center gap-[8px] rounded-[17px] px-[16px] text-[14px] font-semibold leading-none ${HERO_COLOR_TRANSITION} ${
              active ? "text-white" : "text-[#1A1A1A] hover:text-[#8E8BED]"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}) {
  return (
    <div className={className}>
      <p className="mb-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[48px] w-full rounded-[18px] border-[0.5px] border-[#CACACA] bg-white px-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[#3D3D3D]"
      />
    </div>
  );
}

function HeroPriceInput({
  priceDigits,
  setPrice,
}: {
  priceDigits: string;
  setPrice: (value: string) => void;
}) {
  const priceMeasureRef = useRef<HTMLSpanElement>(null);
  const [priceTextWidth, setPriceTextWidth] = useState(0);
  const formattedPrice = formatPriceWithSpaces(priceDigits);

  useLayoutEffect(() => {
    const node = priceMeasureRef.current;
    if (!node) return;
    setPriceTextWidth(node.getBoundingClientRect().width);
  }, [formattedPrice]);

  return (
    <div className="w-[250px] flex-1">
      <p className="mb-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Примерная стоимость</p>
      <div className="relative">
        <span className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] font-normal leading-[170%] text-[#3D3D3D]">
          ~
        </span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formattedPrice}
          onChange={(event) => setPrice(extractPriceDigits(event.target.value))}
          placeholder="0"
          className="h-[48px] w-full rounded-[18px] border-[0.5px] border-[#CACACA] bg-white pl-[28px] pr-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[#3D3D3D]"
          aria-label="Примерная стоимость"
        />
        <span
          ref={priceMeasureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-[28px] top-1/2 -translate-y-1/2 whitespace-pre text-[14px] font-normal leading-[170%]"
        >
          {formattedPrice || "0"}
        </span>
        <span
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[14px] font-normal leading-[170%] text-[#3D3D3D]"
          style={{ left: `calc(28px + ${priceTextWidth}px + 4px)` }}
        >
          руб.
        </span>
      </div>
    </div>
  );
}

function TopFields({
  title,
  setTitle,
  price,
  setPrice,
  city,
  setCity,
  cityOptions,
  onCityInputChange,
  onCityListEndReached,
}: Pick<
  ModeFormFieldsProps,
  | "title"
  | "setTitle"
  | "price"
  | "setPrice"
  | "city"
  | "setCity"
  | "cityOptions"
  | "onCityInputChange"
  | "onCityListEndReached"
>) {
  return (
    <div className="flex h-[69px] gap-[12px]">
      <LabeledInput
        label="Название"
        value={title}
        onChange={setTitle}
        placeholder={titlePlaceholder}
        className="w-[379px]"
      />

      <HeroPriceInput priceDigits={price} setPrice={setPrice} />

      <div className="w-[250px] flex-1">
        <p className="mb-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Город</p>
        <SelectField
          value={city}
          onChange={setCity}
          onInputChange={onCityInputChange}
          onListEndReached={onCityListEndReached}
          options={cityOptions}
          placeholder={cityPlaceholder}
          variant="hero"
          allowCustomValue={false}
          aria-label="Город"
        />
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  tabIndex,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tabIndex: number;
}) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={onClick}
      className={`flex h-[25px] shrink-0 items-center justify-center whitespace-nowrap rounded-[16px] border-[0.5px] px-[12px] text-[12px] font-medium leading-[120%] tracking-[0.001em] transition-colors duration-200 ${
        active
          ? "border-[#8E8BED] bg-[#8E8BED] text-white hover:border-[#9E9EF0] hover:bg-[#9E9EF0]"
          : "border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED] hover:bg-[#F2F4F7]"
      }`}
    >
      {label}
    </button>
  );
}

function HeroExchangeFilters({
  condition,
  setCondition,
}: Pick<ModeFormFieldsProps, "condition" | "setCondition">) {
  const [listingType, setListingType] = useState<"item" | "service">("item");
  const [serviceLevel, setServiceLevel] = useState("");
  const [serviceFormat, setServiceFormat] = useState("");

  const handleListingTypeChange = (next: "item" | "service") => {
    if (next === listingType) return;
    setListingType(next);
    setCondition("");
    setServiceLevel("");
    setServiceFormat("");
  };

  return (
    <div className="relative flex h-[255.5px] w-[464px] flex-col items-start gap-[24px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <HeroBackgroundStar
        className={`pointer-events-none absolute z-0 ${HERO_PANEL_STAR_LEFT} ${HERO_PANEL_STAR_TOP} ${HERO_PANEL_STAR_SIZE}`}
        gradientId="hero-left-filters-star"
      />

      <div className="relative z-[1] flex w-[212px] flex-col items-start gap-[12px]">
        <p className="flex h-[10px] items-center text-[14px] font-normal leading-none text-[#1A1A1A]">Тип объявления</p>
        <div className="relative box-border flex h-[42px] w-[212px] items-center gap-[4px] rounded-[15px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7] p-[4px]">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-[4px] left-[4px] top-[4px] w-[calc(50%-6px)] rounded-[13px] bg-[#8E8BED] ${HERO_TRANSFORM_TRANSITION} ${
              listingType === "service" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            onClick={() => handleListingTypeChange("item")}
            className={`relative z-[1] flex h-full flex-1 items-center justify-center rounded-[13px] text-[14px] font-semibold leading-none tracking-[0.001em] ${HERO_COLOR_TRANSITION} ${
              listingType === "item" ? "text-white" : "text-[#1A1A1A] hover:text-[#8E8BED]"
            }`}
          >
            Вещь
          </button>
          <button
            type="button"
            onClick={() => handleListingTypeChange("service")}
            className={`relative z-[1] flex h-full flex-1 items-center justify-center rounded-[13px] text-[14px] font-semibold leading-none tracking-[0.001em] ${HERO_COLOR_TRANSITION} ${
              listingType === "service" ? "text-white" : "text-[#1A1A1A] hover:text-[#8E8BED]"
            }`}
          >
            Услуга
          </button>
        </div>
      </div>

      <div className="relative z-[2] grid w-full min-h-0 flex-1 content-start">
        <div
          className={`col-start-1 row-start-1 flex w-full flex-col gap-[8px] ${HERO_SWAP_TRANSITION} ${
            listingType === "item"
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1.5 opacity-0"
          }`}
          aria-hidden={listingType !== "item"}
        >
          <p className="flex h-[10px] items-center text-[14px] font-normal leading-none text-[#1A1A1A]">Выберите состояние</p>
          <div className="flex w-full flex-wrap content-start gap-[8px]">
            {HERO_CONDITION_OPTIONS.map((item) => (
              <Fragment key={item}>
                {item === "Требует ремонта" ? <span className="h-0 w-full basis-full" aria-hidden="true" /> : null}
                <FilterChip
                  label={item}
                  active={condition === item}
                  onClick={() => setCondition(item)}
                  tabIndex={listingType === "item" ? 0 : -1}
                />
              </Fragment>
            ))}
          </div>
        </div>

        <div
          className={`col-start-1 row-start-1 flex w-full flex-col gap-[24px] ${HERO_SWAP_TRANSITION} ${
            listingType === "service"
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1.5 opacity-0"
          }`}
          aria-hidden={listingType !== "service"}
        >
          <div className="flex w-full flex-col gap-[8px]">
            <p className="flex h-[10px] items-center text-[14px] font-normal leading-none text-[#1A1A1A]">Выберите уровень работы</p>
            <div className="flex flex-nowrap gap-[8px]">
              {serviceLevelOptions.map((item) => (
                <FilterChip
                  key={item}
                  label={item}
                  active={serviceLevel === item}
                  onClick={() => setServiceLevel(item)}
                  tabIndex={listingType === "service" ? 0 : -1}
                />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-[8px]">
            <p className="flex h-[10px] items-center text-[14px] font-normal leading-none text-[#1A1A1A]">Формат оказания</p>
            <div className="flex flex-nowrap gap-[8px]">
              {serviceFormatOptions.map((item) => (
                <FilterChip
                  key={item}
                  label={item}
                  active={serviceFormat === item}
                  onClick={() => setServiceFormat(item)}
                  tabIndex={listingType === "service" ? 0 : -1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroAddPanel({ onAddListingClick }: { onAddListingClick: () => void }) {
  return (
    <div className="relative h-[255px] w-[464px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <HeroBackgroundStar
        className={`pointer-events-none absolute z-0 ${HERO_PANEL_STAR_LEFT} ${HERO_PANEL_STAR_TOP} ${HERO_PANEL_STAR_SIZE}`}
        gradientId="hero-left-add-star"
      />

      <div className="relative z-10 flex h-full flex-col items-start justify-between">
        <StarMiniIcon className="h-[60px] w-[60px]" />
        <p className="text-left text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
          Вся информация сохранится для будущего создания объявления
        </p>
        <button
          type="button"
          onClick={onAddListingClick}
          className="flex h-[49px] items-center justify-center gap-[12px] rounded-[21px] bg-[#8E8BED] px-[24px] text-white transition-colors duration-200 ease-out hover:bg-[#9E9EF0] active:bg-[#7E7EDD]"
        >
          <span className="text-[24px] font-extrabold leading-[110%]">+</span>
          <span className="text-[14px] font-semibold leading-[120%]">Добавить объявление</span>
        </button>
      </div>
    </div>
  );
}

function HeroAllVariantsPanel({ onViewAllClick }: { onViewAllClick: () => void }) {
  return (
    <div className="relative h-[255px] w-[464px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <HeroBackgroundStar
        className={`pointer-events-none absolute z-0 ${HERO_PANEL_STAR_RIGHT} ${HERO_PANEL_STAR_TOP} ${HERO_PANEL_STAR_SIZE}`}
        gradientId="hero-all-variants-star"
      />

      <h3 className="relative z-10 max-w-[252px] text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
        Посмотрите <span className="text-[#8E8BED]">все</span> варианты
      </h3>

      <button
        type="button"
        onClick={onViewAllClick}
        className="absolute left-[55.17%] right-[9.7%] top-[17.81%] bottom-[18.4%] rounded-full bg-[#8E8BED] p-0 text-white transition-colors duration-200 ease-out hover:bg-[#9E9EF0] active:bg-[#7E7EDD]"
      >
        <span className="pointer-events-none absolute inset-[6.13%_6.44%_6.75%_6.44%] rounded-full border border-white" />
        <span className="pointer-events-none absolute left-[53px] top-[31px] h-[48.44px] w-[58.45px]">
          <HeroViewAllGlyph />
        </span>
        <span className="pointer-events-none absolute inset-[58.9%_21.47%_24.54%_22.09%] flex items-center justify-center text-center text-[14px] font-semibold leading-[120%] tracking-[0.001em]">
          Все варианты
        </span>
        <span className="pointer-events-none absolute left-[-170px] top-[50px] z-[3] h-[90.27px] w-[160.69px]">
          <HeroViewAllArrow />
        </span>
      </button>
    </div>
  );
}

export function ModeFormColumn({
  mode,
  setMode,
  title,
  setTitle,
  price,
  setPrice,
  city,
  setCity,
  cityOptions,
  onCityInputChange,
  onCityListEndReached,
  condition,
  setCondition,
  onAddListingClick,
  onViewAllClick,
}: ModeFormFieldsProps & { onAddListingClick: () => void }) {
  const isExchange = mode === "exchange";

  return (
    <div className="flex h-[535px] w-[952px] flex-col gap-[24px]">
      <div className="h-[255px] w-full rounded-[31px] bg-[#C8FF00] p-[24px]">
        <div className="mb-[48px] flex items-center justify-between">
          <div>
            <ModeHeading isExchange={isExchange} />
            <p className="mt-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Можно ввести не все поля</p>
          </div>
          <TopModeToggle mode={mode} setMode={setMode} />
        </div>

        <TopFields
          title={title}
          setTitle={setTitle}
          price={price}
          setPrice={setPrice}
          city={city}
          setCity={setCity}
          cityOptions={cityOptions}
          onCityInputChange={onCityInputChange}
          onCityListEndReached={onCityListEndReached}
        />
      </div>

      <div className="relative flex h-[255px] gap-[24px]">
        <div className="relative grid h-[255px] w-[464px] shrink-0 overflow-hidden rounded-[31px]">
          <div
            className={`col-start-1 row-start-1 ${HERO_SWAP_TRANSITION} ${
              isExchange
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-1.5 opacity-0"
            }`}
            aria-hidden={!isExchange}
          >
            <HeroExchangeFilters condition={condition} setCondition={setCondition} />
          </div>
          <div
            className={`col-start-1 row-start-1 ${HERO_SWAP_TRANSITION} ${
              !isExchange
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1.5 opacity-0"
            }`}
            aria-hidden={isExchange}
          >
            <HeroAddPanel onAddListingClick={onAddListingClick} />
          </div>
        </div>

        <HeroAllVariantsPanel onViewAllClick={onViewAllClick} />
      </div>
    </div>
  );
}
