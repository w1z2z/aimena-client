"use client";

import { useState } from "react";

import { HERO_CONDITION_OPTIONS } from "@/entities/listing";
import viewAllArrow from "@/shared/ui/icons/view-all-arrow.svg";
import type { SelectOption } from "@/shared/ui/select-field";
import { SelectField } from "@/shared/ui/select-field";

import { cityPlaceholder, pricePlaceholder, titlePlaceholder, type Mode } from "./constants";

const serviceLevelOptions = ["Мастер", "Профессионал", "Специалист", "Новичок"] as const;
const serviceFormatOptions = ["Онлайн", "Офлайн", "С выездом"] as const;

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
  condition: string;
  setCondition: (value: string) => void;
  onViewAllClick: () => void;
};

function TopModeToggle({ mode, setMode }: Pick<ModeFormFieldsProps, "mode" | "setMode">) {
  const tabs = [
    { id: "exchange" as const, label: "Хочу обменять" },
    { id: "browse" as const, label: "Хочу посмотреть" },
  ];

  return (
    <div className="flex h-[70px] w-[346px] items-center gap-[4px] rounded-[21px] border-[0.5px] border-[#CACACA] bg-white p-[8px]">
      {tabs.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`flex h-[54px] flex-1 items-center justify-center gap-[8px] rounded-[17px] px-[16px] text-[14px] font-semibold leading-[120%] transition ${
              active ? "bg-[#8E8BED] text-white" : "bg-white text-[#1A1A1A]"
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

function TopFields({
  title,
  setTitle,
  price,
  setPrice,
  city,
  setCity,
  cityOptions,
}: Pick<ModeFormFieldsProps, "title" | "setTitle" | "price" | "setPrice" | "city" | "setCity" | "cityOptions">) {
  return (
    <div className="flex h-[69px] gap-[12px]">
      <LabeledInput
        label="Название"
        value={title}
        onChange={setTitle}
        placeholder={titlePlaceholder}
        className="w-[379px]"
      />

      <LabeledInput
        label="Примерная стоимость"
        value={price}
        onChange={setPrice}
        placeholder={pricePlaceholder}
        className="w-[250px] flex-1"
      />

      <div className="w-[250px] flex-1">
        <p className="mb-[12px] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Город</p>
        <SelectField
          value={city}
          onChange={setCity}
          options={cityOptions}
          placeholder={cityPlaceholder}
          variant="hero"
          allowCustomValue
          aria-label="Город"
        />
      </div>
    </div>
  );
}

function HeroExchangeFilters({
  condition,
  setCondition,
}: Pick<ModeFormFieldsProps, "condition" | "setCondition">) {
  const [listingType, setListingType] = useState<"item" | "service">("item");
  const options = listingType === "item" ? HERO_CONDITION_OPTIONS : serviceLevelOptions;
  const secondaryOptions = listingType === "service" ? serviceFormatOptions : null;

  return (
    <div className="relative h-[255px] w-[464px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <HeroBackgroundStar className="absolute left-[261px] top-[70px] h-[430px] w-[430px]" gradientId="hero-left-filters-star" />

      <div className="relative z-10 space-y-[24px]">
        <div className="space-y-[12px]">
          <p className="text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Тип объявления</p>
          <div className="flex h-[42px] w-[212px] gap-[4px] rounded-[15px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7] p-[4px]">
            <button
              type="button"
              onClick={() => setListingType("item")}
              className={`h-[34px] w-[100px] rounded-[13px] text-[14px] font-semibold leading-[120%] ${
                listingType === "item" ? "bg-[#8E8BED] text-white" : "bg-transparent text-[#1A1A1A]"
              }`}
            >
              Вещь
            </button>
            <button
              type="button"
              onClick={() => setListingType("service")}
              className={`h-[34px] w-[100px] rounded-[13px] text-[14px] font-semibold leading-[120%] ${
                listingType === "service" ? "bg-[#8E8BED] text-white" : "bg-transparent text-[#1A1A1A]"
              }`}
            >
              Услуга
            </button>
          </div>
        </div>

        <div className="space-y-[8px]">
          <p className="text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
            {listingType === "item" ? "Выберите состояние" : "Выберите уровень работы"}
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {options.map((item) => {
              const active = condition === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCondition(item)}
                  className={`h-[26px] rounded-[16px] border-[0.5px] px-[12px] text-[12px] font-medium leading-[120%] ${
                    active ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#CACACA] bg-white text-[#1A1A1A]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {secondaryOptions ? (
          <div className="space-y-[8px]">
            <p className="text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Формат оказания</p>
            <div className="flex flex-wrap gap-[8px]">
              {secondaryOptions.map((item) => {
                const active = condition === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCondition(item)}
                    className={`h-[26px] rounded-[16px] border-[0.5px] px-[12px] text-[14px] font-semibold leading-[120%] ${
                      active ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#CACACA] bg-white text-[#1A1A1A]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HeroAddPanel({ onAddListingClick }: { onAddListingClick: () => void }) {
  return (
    <div className="relative h-[255px] w-[464px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <HeroBackgroundStar className="absolute left-[261px] top-[70px] h-[430px] w-[430px]" gradientId="hero-left-add-star-1" />
      <HeroBackgroundStar className="absolute left-[218px] top-[160px] h-[577px] w-[577px]" gradientId="hero-left-add-star-2" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between">
        <div className="h-[68px]" aria-hidden="true" />
        <p className="text-center text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
          Вся информация сохранится для будущего создания объявления
        </p>
        <button
          type="button"
          onClick={onAddListingClick}
          className="flex h-[49px] items-center justify-center gap-[12px] rounded-[21px] bg-[#8E8BED] px-[24px] text-white"
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
      <HeroBackgroundStar className="absolute left-[-227px] top-[70px] h-[430px] w-[430px]" gradientId="hero-all-variants-star" />

      <h3 className="relative z-10 max-w-[252px] text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
        Посмотрите все варианты
      </h3>

      <button
        type="button"
        onClick={onViewAllClick}
        className="absolute left-[55.17%] right-[9.7%] top-[17.81%] bottom-[18.4%] rounded-full bg-[#8E8BED] p-0 text-white"
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
            <h2 className="text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
              {isExchange ? "Что хотите обменять?" : "Что хотите посмотреть?"}
            </h2>
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
        />
      </div>

      <div className="relative flex h-[255px] gap-[24px]">
        {isExchange ? (
          <HeroExchangeFilters condition={condition} setCondition={setCondition} />
        ) : (
          <HeroAddPanel onAddListingClick={onAddListingClick} />
        )}

        <HeroAllVariantsPanel onViewAllClick={onViewAllClick} />
      </div>
    </div>
  );
}
