"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldVariant = "filter" | "field" | "hero";

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  variant?: SelectFieldVariant;
  className?: string;
  searchable?: boolean;
  allowCustomValue?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

const LIST_GAP = 4;
const LIST_MAX_HEIGHT = 280;
const VIEWPORT_PADDING = 8;

function getLabelForValue(options: readonly SelectOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function filterOptions(options: readonly SelectOption[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`site-select__chevron-icon${open ? " is-open" : ""}`}
      aria-hidden="true"
    >
      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SelectField({
  value,
  onChange,
  onInputChange,
  options,
  placeholder,
  variant = "field",
  className,
  searchable = true,
  allowCustomValue = false,
  disabled = false,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => getLabelForValue(options, value));
  const [listStyle, setListStyle] = useState<CSSProperties>({ visibility: "hidden" });
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const visibleOptions = useMemo(
    () => (searchable ? filterOptions(options, inputValue) : options),
    [inputValue, options, searchable],
  );

  useEffect(() => {
    setInputValue(getLabelForValue(options, value));
  }, [options, value]);

  const close = useCallback(() => setIsOpen(false), []);

  const updateListPosition = useCallback(() => {
    const trigger = rootRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      LIST_MAX_HEIGHT,
      Math.max(120, openUpward ? spaceAbove - LIST_GAP : spaceBelow - LIST_GAP),
    );

    setListStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + LIST_GAP,
      bottom: openUpward ? window.innerHeight - rect.top + LIST_GAP : undefined,
      maxHeight,
      visibility: "visible",
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateListPosition();

    const handleReposition = () => updateListPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateListPosition, visibleOptions.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, isOpen]);

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    onInputChange?.(nextValue);
    if (allowCustomValue) onChange(nextValue);
    if (!isOpen) setIsOpen(true);
  };

  const handleOptionPick = (option: SelectOption) => {
    setInputValue(option.label);
    onChange(option.value);
    close();
  };

  const handleBlur = () => {
    if (!searchable) return;

    const trimmed = inputValue.trim();
    const matched = options.find((option) => option.label.toLowerCase() === trimmed.toLowerCase());

    if (matched) {
      setInputValue(matched.label);
      if (matched.value !== value) onChange(matched.value);
      return;
    }

    if (allowCustomValue) {
      if (trimmed !== value) onChange(trimmed);
      return;
    }

    setInputValue(getLabelForValue(options, value));
  };

  const showPlaceholderState = !value && !inputValue.trim();

  const list = isOpen ? (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      className="site-select__list"
      style={listStyle}
      onWheel={(event) => event.stopPropagation()}
    >
      {visibleOptions.length > 0 ? (
        visibleOptions.map((option) => (
          <li key={option.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`site-select__option${option.value === value ? " is-selected" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleOptionPick(option)}
            >
              {option.label}
            </button>
          </li>
        ))
      ) : (
        <li className="site-select__empty" role="presentation">
          Ничего не найдено
        </li>
      )}
    </ul>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`site-select site-select--${variant}${className ? ` ${className}` : ""}${isOpen ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}
    >
      <div className="site-select__control">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          value={inputValue}
          placeholder={placeholder}
          readOnly={!searchable}
          disabled={disabled}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={handleBlur}
          className={`site-select__input${showPlaceholderState ? " is-placeholder" : ""}`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? "Скрыть варианты" : "Показать варианты"}
          className="site-select__chevron"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => !disabled && setIsOpen((current) => !current)}
        >
          <ChevronIcon open={isOpen} />
        </button>
      </div>

      {typeof document !== "undefined" && list ? createPortal(list, document.body) : null}
    </div>
  );
}
