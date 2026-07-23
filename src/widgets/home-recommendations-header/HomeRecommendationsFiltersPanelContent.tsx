"use client";

import { useCallback } from "react";

import { FILTER_CONDITION_OPTIONS } from "@/entities/listing";
import { useHomeSearch } from "@/features/home-search";
import type {
  ConditionOptionId,
  ListingMode,
  SearchMode,
  ServiceFormatId,
} from "@/features/home-search/types";
import { placeholders } from "@/shared/config/tokens";
import { ToggleStarIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";

const dateOptions = [
  { id: "all", label: "За всё время" },
  { id: "today", label: "За сегодня" },
  { id: "week", label: "За неделю" },
  { id: "month", label: "За месяц" },
  { id: "year", label: "За год" },
] as const;

const conditionOptions = FILTER_CONDITION_OPTIONS;

const serviceFormatOptions = [
  { id: "online", label: "Онлайн" },
  { id: "onsite", label: "Выезд" },
  { id: "client", label: "У клиента" },
] as const;

const titleQueryPlaceholder = placeholders.listingTitle;

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
        <span className="home-filters-panel__toggle-knob">
          <ToggleStarIcon
            className={`home-filters-panel__toggle-star${checked ? " is-on" : ""}`}
          />
        </span>
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

function FilterSearchModeSwitch({
  value,
  onChange,
}: {
  value: SearchMode;
  onChange: (next: SearchMode) => void;
}) {
  return (
    <div
      className="home-filters-panel__mode-switch"
      data-active={value}
      role="radiogroup"
      aria-label="Режим поиска"
    >
      <span className="home-filters-panel__mode-switch-indicator" aria-hidden="true" />
      <button
        type="button"
        role="radio"
        aria-checked={value === "want"}
        onClick={() => onChange("want")}
        className={`home-filters-panel__mode-switch-btn${value === "want" ? " is-active" : ""}`}
      >
        Отдают
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "have"}
        onClick={() => onChange("have")}
        className={`home-filters-panel__mode-switch-btn${value === "have" ? " is-active" : ""}`}
      >
        Хотят
      </button>
    </div>
  );
}

export function HomeRecommendationsFiltersPanelContent() {
  const {
    filters,
    setFilters,
    resetFilters,
    applyFilters,
    cityOptions,
    onCityInputChange,
    onCityListEndReached,
    pinSelectedCity,
    categories,
  } = useHomeSearch();
  const categoryComboboxOptions = categories.map((item) => ({
    value: item.id,
    label: item.label,
  }));

  const {
    listingMode,
    searchMode,
    category,
    city,
    priceFrom,
    priceTo,
    approximatePrice,
    datePeriod,
    conditions,
    withSurcharge,
    withDocuments,
    serviceFormats,
    verifiedProvider,
    titleQuery,
  } = filters;

  const updateFilters = useCallback(
    (patch: Partial<typeof filters>) => {
      setFilters((current) => ({ ...current, ...patch }));
    },
    [setFilters],
  );

  const toggleCondition = useCallback(
    (id: ConditionOptionId) => {
      setFilters((current) => ({
        ...current,
        conditions: current.conditions.includes(id)
          ? current.conditions.filter((item) => item !== id)
          : [...current.conditions, id],
      }));
    },
    [setFilters],
  );

  const toggleServiceFormat = useCallback(
    (id: ServiceFormatId) => {
      setFilters((current) => ({
        ...current,
        serviceFormats: current.serviceFormats.includes(id)
          ? current.serviceFormats.filter((item) => item !== id)
          : [...current.serviceFormats, id],
      }));
    },
    [setFilters],
  );

  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <div className="home-filters-panel">
      <h3 className="home-filters-panel__title">Фильтры</h3>

      <div className="home-filters-panel__top-row">
        <div className="home-filters-panel__search-mode">
          <p className="home-filters-panel__field-label">Искать по</p>
          <FilterSearchModeSwitch
            value={searchMode}
            onChange={(next) => updateFilters({ searchMode: next })}
          />
        </div>

        <div className="home-filters-panel__title-query">
          <p className="home-filters-panel__field-label">Название / тег</p>
          <input
            type="text"
            value={titleQuery}
            onChange={(event) => updateFilters({ titleQuery: event.target.value })}
            className="home-filters-panel__input home-filters-panel__input--title-query"
            placeholder={titleQueryPlaceholder}
            aria-label="Название или тег"
          />
        </div>
      </div>

      <div className="home-filters-panel__city">
        <p className="home-filters-panel__field-label home-filters-panel__field-label--golos">
          Выберите город
        </p>
        <SelectField
          value={city}
          onChange={(next) => {
            updateFilters({ city: next });
            if (!next) {
              pinSelectedCity(null);
              return;
            }
            const option = cityOptions.find((item) => item.value === next && !item.disabled);
            if (option) pinSelectedCity(option);
          }}
          onInputChange={onCityInputChange}
          onListEndReached={onCityListEndReached}
          options={cityOptions}
          placeholder="Выберите город"
          variant="filter"
          allowCustomValue={false}
          className="home-filters-panel__select-wrap"
          aria-label="Выберите город"
        />
      </div>

      <div className="home-filters-panel__right">
        <div className="home-filters-panel__right-section">
          <p className="home-filters-panel__field-label">Тип объявления</p>
          <FilterModeSwitch
            value={listingMode}
            onChange={(next) => updateFilters({ listingMode: next })}
          />
        </div>

        <div className="home-filters-panel__right-section">
          <p className="home-filters-panel__field-label">Категория</p>
          <SelectField
            value={category}
            onChange={(next) => updateFilters({ category: next })}
            options={categoryComboboxOptions}
            variant="filter"
            searchable={false}
            className="home-filters-panel__select-wrap home-filters-panel__select-wrap--right"
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
                onChange={(next) => updateFilters({ withDocuments: next })}
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
                onChange={(next) => updateFilters({ verifiedProvider: next })}
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
              onClick={() => updateFilters({ datePeriod: item.id })}
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
              value={approximatePrice || priceFrom}
              onChange={(event) =>
                updateFilters({
                  priceFrom: event.target.value,
                  priceTo: approximatePrice || priceTo,
                  approximatePrice: "",
                })
              }
              className="home-filters-panel__input home-filters-panel__input--narrow"
              placeholder="От"
            />
            <input
              type="text"
              value={approximatePrice || priceTo}
              onChange={(event) =>
                updateFilters({
                  priceFrom: approximatePrice || priceFrom,
                  priceTo: event.target.value,
                  approximatePrice: "",
                })
              }
              className="home-filters-panel__input home-filters-panel__input--narrow"
              placeholder="До"
            />
          </div>
          <div className="home-filters-panel__surcharge">
            <FilterToggle
              checked={withSurcharge}
              label="С доплатой"
              onChange={(next) => updateFilters({ withSurcharge: next })}
            />
          </div>
        </div>
      </div>

      <div className="home-filters-panel__actions">
        <button type="button" onClick={handleReset} className="home-filters-panel__reset">
          Сбросить
        </button>
        <button type="button" onClick={applyFilters} className="home-filters-panel__apply">
          Применить
        </button>
      </div>
    </div>
  );
}
