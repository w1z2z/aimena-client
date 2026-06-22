"use client";

import { useCallback, useState } from "react";

const cityOptions = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"];

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
  { id: "service", label: "Услуга" },
] as const;

type DateOptionId = (typeof dateOptions)[number]["id"];
type ConditionOptionId = (typeof conditionOptions)[number]["id"];

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

export function HomeRecommendationsFiltersPanelContent() {
  const [city, setCity] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [datePeriod, setDatePeriod] = useState<DateOptionId>("today");
  const [conditions, setConditions] = useState<ConditionOptionId[]>([]);
  const [withSurcharge, setWithSurcharge] = useState(false);
  const [withDocuments, setWithDocuments] = useState(true);

  const toggleCondition = useCallback((id: ConditionOptionId) => {
    setConditions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const handleReset = useCallback(() => {
    setCity("");
    setPriceFrom("");
    setPriceTo("");
    setDatePeriod("today");
    setConditions([]);
    setWithSurcharge(false);
    setWithDocuments(true);
  }, []);

  return (
    <div className="home-filters-panel">
      <h3 className="home-filters-panel__title">Фильтры</h3>

      <div className="home-filters-panel__city">
        <p className="home-filters-panel__field-label home-filters-panel__field-label--golos">
          Выберите город
        </p>
        <div className="home-filters-panel__select-wrap">
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={`home-filters-panel__input home-filters-panel__input--price-row home-filters-panel__select${city ? "" : " is-placeholder"}`}
          >
            <option value="" disabled hidden>
              Выберите город
            </option>
            {cityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="home-filters-panel__select-chevron" aria-hidden="true">
            ▼
          </span>
        </div>
      </div>

      <div className="home-filters-panel__condition">
        <p className="home-filters-panel__field-label">Выберите состояние</p>
        <div className="home-filters-panel__pills home-filters-panel__pills--condition">
          {conditionOptions.map((item) => {
            const active = conditions.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCondition(item.id)}
                aria-pressed={active}
                className={`home-filters-panel__pill home-filters-panel__pill--condition${active ? " is-active" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="home-filters-panel__documents">
        <FilterToggle checked={withDocuments} label="С документами" onChange={setWithDocuments} />
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
