"use client";

import { useCallback, useState } from "react";

import { categoryItems, type CategoryId } from "@/shared/ui/icons/category-icons";
import { ComboboxField } from "@/shared/ui/combobox-field/ComboboxField";

const cityOptions = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"];
const cityComboboxOptions = cityOptions.map((city) => ({ value: city, label: city }));

const dateOptions = [
  { id: "today", label: "За сегодня" },
  { id: "week", label: "За неделю" },
  { id: "month", label: "За месяц" },
  { id: "year", label: "За год" },
] as const;

const conditionOptions = [
  { id: "excellent", label: "Отличное" },
  { id: "new", label: "Новое" },
  { id: "good", label: "Хорошее" },
  { id: "used", label: "Б.у" },
  { id: "repair", label: "Требует ремонта" },
] as const;

const serviceFormatOptions = [
  { id: "online", label: "Онлайн" },
  { id: "onsite", label: "Выезд" },
  { id: "client", label: "У клиента" },
] as const;

type DateOptionId = (typeof dateOptions)[number]["id"];
type ConditionOptionId = (typeof conditionOptions)[number]["id"];
type ServiceFormatId = (typeof serviceFormatOptions)[number]["id"];
type ListingMode = "item" | "service";

const filterCategoryOptions = [
  ...categoryItems.filter((item) => item.id === "all"),
  ...categoryItems.filter((item) => item.id !== "all"),
];

const categoryComboboxOptions = filterCategoryOptions.map((item) => ({
  value: item.id,
  label: item.label,
}));

function FilterToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="home-filters-panel__toggle">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`home-filters-panel__toggle-track${checked ? " is-on" : ""}`}
      >
        <span className="home-filters-panel__toggle-knob" />
      </button>
      <span className="home-filters-panel__toggle-label">{label}</span>
    </label>
  );
}

function FilterModeSwitch({
  value,
  onChange,
}: {
  value: ListingMode;
  onChange: (next: ListingMode) => void;
}) {
  return (
    <div
      className="home-filters-panel__mode-switch"
      data-active={value}
      role="radiogroup"
      aria-label="Тип объявления"
    >
      <span className="home-filters-panel__mode-switch-indicator" aria-hidden="true" />
      <button
        type="button"
        role="radio"
        aria-checked={value === "item"}
        onClick={() => onChange("item")}
        className={`home-filters-panel__mode-switch-btn${value === "item" ? " is-active" : ""}`}
      >
        Вещь
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "service"}
        onClick={() => onChange("service")}
        className={`home-filters-panel__mode-switch-btn${value === "service" ? " is-active" : ""}`}
      >
        Услуга
      </button>
    </div>
  );
}

function FilterPills<T extends string>({
  options,
  selected,
  onToggle,
  nowrap = true,
}: {
  options: ReadonlyArray<{ id: T; label: string }>;
  selected: T[];
  onToggle: (id: T) => void;
  nowrap?: boolean;
}) {
  return (
    <div
      className={`home-filters-panel__pills${nowrap ? " home-filters-panel__pills--nowrap" : ""}`}
    >
      {options.map((item) => {
        const active = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            aria-pressed={active}
            className={`home-filters-panel__pill home-filters-panel__pill--condition${active ? " is-active" : ""}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function HomeRecommendationsFiltersPanelContent() {
  const [listingMode, setListingMode] = useState<ListingMode>("item");
  const [category, setCategory] = useState<CategoryId>("all");
  const [city, setCity] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [datePeriod, setDatePeriod] = useState<DateOptionId>("today");
  const [conditions, setConditions] = useState<ConditionOptionId[]>([]);
  const [withSurcharge, setWithSurcharge] = useState(false);
  const [withDocuments, setWithDocuments] = useState(false);
  const [serviceFormats, setServiceFormats] = useState<ServiceFormatId[]>([]);
  const [verifiedProvider, setVerifiedProvider] = useState(false);

  const toggleCondition = useCallback((id: ConditionOptionId) => {
    setConditions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const toggleServiceFormat = useCallback((id: ServiceFormatId) => {
    setServiceFormats((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const handleReset = useCallback(() => {
    setListingMode("item");
    setCategory("all");
    setCity("");
    setPriceFrom("");
    setPriceTo("");
    setDatePeriod("today");
    setConditions([]);
    setWithSurcharge(false);
    setWithDocuments(false);
    setServiceFormats([]);
    setVerifiedProvider(false);
  }, []);

  return (
    <div className="home-filters-panel">
      <h3 className="home-filters-panel__title">Фильтры</h3>

      <div className="home-filters-panel__city">
        <p className="home-filters-panel__field-label home-filters-panel__field-label--golos">
          Выберите город
        </p>
        <ComboboxField
          value={city}
          onChange={setCity}
          onInputChange={setCity}
          options={cityComboboxOptions}
          placeholder="Выберите город"
          wrapClassName="home-filters-panel__select-wrap"
          inputClassName={`home-filters-panel__input home-filters-panel__input--price-row home-filters-panel__combobox-input${city ? "" : " is-placeholder"}`}
          listClassName="home-filters-panel__combobox-list"
          optionClassName="home-filters-panel__combobox-option"
          chevronClassName="home-filters-panel__select-chevron"
          aria-label="Выберите город"
        />
      </div>

      <div className="home-filters-panel__right">
        <FilterModeSwitch value={listingMode} onChange={setListingMode} />

        <div className="home-filters-panel__right-section">
          <p className="home-filters-panel__field-label">Категория</p>
          <ComboboxField
            value={category}
            onChange={(next) => setCategory(next as CategoryId)}
            options={categoryComboboxOptions}
            wrapClassName="home-filters-panel__select-wrap home-filters-panel__select-wrap--right"
            inputClassName="home-filters-panel__input home-filters-panel__input--right home-filters-panel__combobox-input"
            listClassName="home-filters-panel__combobox-list"
            optionClassName="home-filters-panel__combobox-option"
            chevronClassName="home-filters-panel__select-chevron"
            aria-label="Категория"
          />
        </div>

        {listingMode === "item" ? (
          <>
            <div className="home-filters-panel__right-section">
              <p className="home-filters-panel__field-label">Выберите состояние</p>
              <FilterPills
                options={conditionOptions}
                selected={conditions}
                onToggle={toggleCondition}
              />
            </div>

            <div className="home-filters-panel__right-section home-filters-panel__right-section--toggle">
              <FilterToggle
                checked={withDocuments}
                label="С документами"
                onChange={setWithDocuments}
              />
            </div>
          </>
        ) : (
          <>
            <div className="home-filters-panel__right-section">
              <p className="home-filters-panel__field-label">Формат оказания</p>
              <FilterPills
                options={serviceFormatOptions}
                selected={serviceFormats}
                onToggle={toggleServiceFormat}
              />
            </div>

            <div className="home-filters-panel__right-section home-filters-panel__right-section--toggle">
              <FilterToggle
                checked={verifiedProvider}
                label="Проверенный исполнитель"
                onChange={setVerifiedProvider}
              />
            </div>
          </>
        )}
      </div>

      <div className="home-filters-panel__date">
        <p className="home-filters-panel__field-label">Дата публикации:</p>
        <div className="home-filters-panel__pills home-filters-panel__pills--date">
          {dateOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDatePeriod(item.id)}
              className={`home-filters-panel__pill home-filters-panel__pill--date${datePeriod === item.id ? " is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="home-filters-panel__price">
        <p className="home-filters-panel__field-label home-filters-panel__field-label--golos">
          Примерная стоимость
        </p>
        <div className="home-filters-panel__price-row">
          <div className="home-filters-panel__price-inputs">
            <input
              type="text"
              value={priceFrom}
              onChange={(event) => setPriceFrom(event.target.value)}
              className="home-filters-panel__input home-filters-panel__input--narrow"
              placeholder="От"
            />
            <input
              type="text"
              value={priceTo}
              onChange={(event) => setPriceTo(event.target.value)}
              className="home-filters-panel__input home-filters-panel__input--narrow"
              placeholder="До"
            />
          </div>
          <div className="home-filters-panel__surcharge">
            <FilterToggle checked={withSurcharge} label="С доплатой" onChange={setWithSurcharge} />
          </div>
        </div>
      </div>

      <div className="home-filters-panel__actions">
        <button type="button" onClick={handleReset} className="home-filters-panel__reset">
          Сбросить
        </button>
        <button type="button" className="home-filters-panel__apply">
          Применить
        </button>
      </div>
    </div>
  );
}
