"use client";

import { useRef } from "react";

import { HERO_CONDITION_OPTIONS } from "@/entities/listing";
import { WantAllIcon, WantBrowseIcon, WantExchangeIcon } from "@/shared/ui/icons";
import type { SelectOption } from "@/shared/ui/select-field";
import { SelectField } from "@/shared/ui/select-field";

import {
  cityPlaceholder,
  fieldClassName,
  pricePlaceholder,
  titlePlaceholder,
  type Mode,
} from "./constants";
import { useIsSafari, useSafariPanelAnimation } from "./lib/safari";

const conditionOptions = [...HERO_CONDITION_OPTIONS];

export type ModeFormFieldsProps = {
  title: string;
  setTitle: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  cityOptions: SelectOption[];
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
  cityOptions,
}: Pick<ModeFormFieldsProps, "price" | "setPrice" | "city" | "setCity" | "cityOptions">) {
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
          options={cityOptions}
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

function ColoredPanelContent({
  isExchange,
  title,
  setTitle,
  price,
  setPrice,
  city,
  setCity,
  ...browseFields
}: ModeFormFieldsProps & { isExchange: boolean }) {
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

      <PriceCityFields
        price={price}
        setPrice={setPrice}
        city={city}
        setCity={setCity}
        cityOptions={browseFields.cityOptions}
      />

      <BrowseOnlyFields isExchange={isExchange} {...browseFields} />
    </>
  );
}

export function ModeFormColumn({
  isExchange,
  onAddListingClick,
  ...fields
}: ModeFormFieldsProps & { isExchange: boolean; onAddListingClick: () => void }) {
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
            onClick={onAddListingClick}
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

export function renderTabIcon(tabId: Mode, active: boolean) {
  if (tabId === "exchange") return <WantExchangeIcon active={active} className="h-[17px] w-[15px]" />;
  if (tabId === "browse") return <WantBrowseIcon active={active} className="h-4 w-4" />;
  return <WantAllIcon active={active} className="h-4 w-4" />;
}
