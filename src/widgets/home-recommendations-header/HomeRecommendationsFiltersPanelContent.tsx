"use client";

import { startTransition, useCallback, useMemo } from "react";

import { FILTER_CONDITION_OPTIONS } from "@/entities/listing";
import { useHomeSearch } from "@/features/home-search";
import type {
  ConditionOptionId,
  ListingMode,
  SearchMode,
  ServiceFormatId,
} from "@/features/home-search/types";
import { extractPriceDigits, formatPriceWithSpaces } from "@/shared/lib/format-price";
import { Switch } from "@/shared/ui/switch/Switch";
import { SelectField } from "@/shared/ui/select-field";

const dateOptions = [
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
    <div className="home-filters-panel__toggle">
      <Switch checked={checked} onChange={onChange} aria-label={label} />
      <button
        type="button"
        className="home-filters-panel__toggle-label"
        onClick={() => onChange(!checked)}
      >
        {label}
      </button>
    </div>
  );
}

function FilterModeSwitch({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: ReadonlyArray<{ id: string; label: string }>;
  "aria-label": string;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  return (
    <div
      className={`home-filters-panel__mode-switch${className ? ` ${className}` : ""}`}
      data-active-index={activeIndex}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className="home-filters-panel__mode-switch-indicator"
        style={{ transform: `translateX(calc(${activeIndex} * (100% + 4px)))` }}
      />
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (option.id === value) return;
              startTransition(() => onChange(option.id));
            }}
            className={`home-filters-panel__mode-switch-btn${active ? " is-active" : ""}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterPills<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<{ id: T; label: string }>;
  selected: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <div className="home-filters-panel__pills">
      {options.map((item) => {
        const active = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            aria-pressed={active}
            className={`home-filters-panel__pill${active ? " is-active" : ""}`}
          >
            {item.label}
          </button>
        );
      })}
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
    categoryTree,
  } = useHomeSearch();

  const {
    listingMode,
    searchMode,
    categoryParentId,
    categoryChildId,
    city,
    priceFrom,
    priceTo,
    datePeriod,
    conditions,
    withSurcharge,
    withDocuments,
    serviceFormats,
    verifiedProvider,
    titleQuery,
  } = filters;

  const parentCategoryOptions = useMemo(
    () =>
      categoryTree.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [categoryTree],
  );

  const selectedParentCategory = useMemo(
    () => categoryTree.find((item) => item.id === categoryParentId) ?? null,
    [categoryParentId, categoryTree],
  );

  const childCategoryOptions = useMemo(
    () =>
      (selectedParentCategory?.children ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [selectedParentCategory],
  );

  const hasSubcategories = childCategoryOptions.length > 0;

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

  const handleListingModeChange = useCallback(
    (next: string) => {
      updateFilters({ listingMode: next as ListingMode });
    },
    [updateFilters],
  );

  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <div className="home-filters-panel">
      <div className="home-filters-panel__body">
        <div className="home-filters-panel__left">
          <div className="home-filters-panel__switches-row">
            <div className="home-filters-panel__switch-group">
              <p className="home-filters-panel__field-label">Искать по</p>
              <FilterModeSwitch
                className="home-filters-panel__mode-switch--search"
                aria-label="Режим поиска"
                value={searchMode}
                onChange={(next) => updateFilters({ searchMode: next as SearchMode })}
                options={[
                  { id: "want", label: "Отдают" },
                  { id: "have", label: "Хотят" },
                ]}
              />
            </div>

            <div className="home-filters-panel__switch-group">
              <p className="home-filters-panel__field-label">Тип объявления</p>
              <FilterModeSwitch
                aria-label="Тип объявления"
                value={listingMode}
                onChange={handleListingModeChange}
                options={[
                  { id: "item", label: "Вещь" },
                  { id: "service", label: "Услуга" },
                ]}
              />
            </div>
          </div>

          <div className="home-filters-panel__field">
            <p className="home-filters-panel__field-label">Название</p>
            <input
              type="text"
              value={titleQuery}
              onChange={(event) => updateFilters({ titleQuery: event.target.value })}
              className="home-filters-panel__input"
              placeholder="Введите название"
              aria-label="Название"
            />
          </div>

          <div className="home-filters-panel__field">
            <p className="home-filters-panel__field-label">Выберите город</p>
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

          <div className="home-filters-panel__field">
            <p className="home-filters-panel__field-label">Категория</p>
            <div className="home-filters-panel__category-row">
              <div className="home-filters-panel__category-main">
                <SelectField
                  value={categoryParentId}
                  onChange={(next) =>
                    updateFilters({
                      categoryParentId: next,
                      categoryChildId: "",
                    })
                  }
                  options={parentCategoryOptions}
                  variant="filter"
                  searchable={false}
                  placeholder="Введите категорию"
                  className="home-filters-panel__select-wrap"
                  aria-label="Категория"
                />
              </div>
              <div
                className={`home-filters-panel__subcategory${hasSubcategories ? " is-open" : ""}`}
              >
                <div className="home-filters-panel__subcategory-inner">
                  <div className="home-filters-panel__subcategory-content">
                    <SelectField
                      value={categoryChildId}
                      onChange={(next) => updateFilters({ categoryChildId: next })}
                      options={childCategoryOptions}
                      variant="filter"
                      searchable={false}
                      placeholder="Подкатегория"
                      className="home-filters-panel__select-wrap"
                      disabled={!hasSubcategories}
                      aria-label="Подкатегория"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-filters-panel__field home-filters-panel__field--price">
            <p className="home-filters-panel__field-label">Примерная стоимость</p>
            <div className="home-filters-panel__price-inputs">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formatPriceWithSpaces(priceFrom)}
                onChange={(event) =>
                  updateFilters({
                    priceFrom: extractPriceDigits(event.target.value),
                  })
                }
                className="home-filters-panel__input home-filters-panel__input--price"
                placeholder="От"
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formatPriceWithSpaces(priceTo)}
                onChange={(event) =>
                  updateFilters({
                    priceTo: extractPriceDigits(event.target.value),
                  })
                }
                className="home-filters-panel__input home-filters-panel__input--price"
                placeholder="До"
              />
            </div>
          </div>
        </div>

        <div className="home-filters-panel__right">
          <div className="home-filters-panel__mode-swap">
            <div
              className={`home-filters-panel__mode-swap-pane${
                listingMode === "item" ? " is-active" : ""
              }`}
              aria-hidden={listingMode !== "item"}
              inert={listingMode !== "item" ? true : undefined}
            >
              <div className="home-filters-panel__right-section">
                <p className="home-filters-panel__field-label">Выберите состояние</p>
                <FilterPills
                  options={conditionOptions}
                  selected={conditions}
                  onToggle={toggleCondition}
                />
              </div>
            </div>

            <div
              className={`home-filters-panel__mode-swap-pane${
                listingMode === "service" ? " is-active" : ""
              }`}
              aria-hidden={listingMode !== "service"}
              inert={listingMode !== "service" ? true : undefined}
            >
              <div className="home-filters-panel__right-section">
                <p className="home-filters-panel__field-label">Формат оказания</p>
                <FilterPills
                  options={serviceFormatOptions}
                  selected={serviceFormats}
                  onToggle={toggleServiceFormat}
                />
              </div>
            </div>
          </div>

          <div className="home-filters-panel__right-section">
            <p className="home-filters-panel__field-label">Дата публикации:</p>
            <div className="home-filters-panel__pills home-filters-panel__pills--date">
              {dateOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateFilters({ datePeriod: item.id })}
                  className={`home-filters-panel__pill${datePeriod === item.id ? " is-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="home-filters-panel__toggles-row">
            <FilterToggle
              checked={withSurcharge}
              label="С доплатой"
              onChange={(next) => updateFilters({ withSurcharge: next })}
            />
            <div className="home-filters-panel__mode-swap home-filters-panel__mode-swap--toggle">
              <div
                className={`home-filters-panel__mode-swap-pane${
                  listingMode === "item" ? " is-active" : ""
                }`}
                aria-hidden={listingMode !== "item"}
                inert={listingMode !== "item" ? true : undefined}
              >
                <FilterToggle
                  checked={withDocuments}
                  label="С документами"
                  onChange={(next) => updateFilters({ withDocuments: next })}
                />
              </div>
              <div
                className={`home-filters-panel__mode-swap-pane${
                  listingMode === "service" ? " is-active" : ""
                }`}
                aria-hidden={listingMode !== "service"}
                inert={listingMode !== "service" ? true : undefined}
              >
                <FilterToggle
                  checked={verifiedProvider}
                  label="Проверенный исполнитель"
                  onChange={(next) => updateFilters({ verifiedProvider: next })}
                />
              </div>
            </div>
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
