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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldVariant = "filter" | "field" | "hero";

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  onListEndReached?: () => void;
  options: readonly SelectOption[];
  placeholder?: string;
  variant?: SelectFieldVariant;
  className?: string;
  searchable?: boolean;
  allowCustomValue?: boolean;
  /** When value is set, chevron becomes a clear (×) control. */
  clearable?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

const LIST_GAP = 4;
const LIST_MAX_HEIGHT = 280;
const VIEWPORT_PADDING = 8;

function getLabelForValue(options: readonly SelectOption[], value: string) {
  const normalizedValue = value ?? "";
  return (
    options.find((option) => option.value === normalizedValue && !option.disabled)?.label ??
    normalizedValue
  );
}

function filterOptions(options: readonly SelectOption[], query: string) {
  const normalized = (query ?? "").trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="site-select__clear-icon"
      aria-hidden="true"
    >
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
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
  onListEndReached,
  options,
  placeholder,
  variant = "field",
  className,
  searchable = true,
  allowCustomValue = false,
  clearable = false,
  disabled = false,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const safeValue = value ?? "";
  const isDisabled = Boolean(disabled);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState(() => getLabelForValue(options, safeValue));
  const [activeOptionValue, setActiveOptionValue] = useState<string | null>(null);
  const [listStyle, setListStyle] = useState<CSSProperties>({ visibility: "hidden" });
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const safeValueRef = useRef(safeValue);
  const optionsRef = useRef(options);
  const listId = useId();
  const showClear = clearable && Boolean(safeValue) && !isDisabled;

  safeValueRef.current = safeValue;
  optionsRef.current = options;

  const visibleOptions = useMemo(
    () => (searchable ? filterOptions(options, inputValue ?? "") : options),
    [inputValue, options, searchable],
  );
  const selectableOptions = useMemo(
    () => visibleOptions.filter((option) => !option.disabled),
    [visibleOptions],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setInputValue(getLabelForValue(options, safeValue));
    // Intentionally do not depend on options:
    // options are frequently re-fetched while user types, and syncing on each
    // options change would wipe in-progress input before explicit selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  useEffect(() => {
    if (!searchable) {
      setInputValue(getLabelForValue(options, safeValue));
    }
  }, [options, safeValue, searchable]);

  useEffect(() => {
    if (!isOpen) {
      setActiveOptionValue(null);
      return;
    }

    if (selectableOptions.length === 0) {
      setActiveOptionValue(null);
      return;
    }

    setActiveOptionValue((current) => {
      if (current && selectableOptions.some((option) => option.value === current)) {
        return current;
      }

      const selectedOption = selectableOptions.find((option) => option.value === safeValue);
      return selectedOption?.value ?? selectableOptions[0].value;
    });
  }, [isOpen, selectableOptions, safeValue]);

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

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        listRootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
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
    setActiveOptionValue(null);
    onInputChange?.(nextValue);
    if (allowCustomValue) {
      onChange(nextValue);
    } else if (!nextValue.trim() && safeValue) {
      onChange("");
    }
    if (!isOpen) setIsOpen(true);
  };

  const handleOptionPick = (option: SelectOption) => {
    if (option.disabled) return;
    // Safari can jump the page when a portaled list closes or layout shifts
    // after selection (e.g. subcategory panel opening on create-listing).
    const scrollY = window.scrollY;
    const restoreScroll = () => {
      if (Math.abs(window.scrollY - scrollY) > 1) {
        window.scrollTo(window.scrollX, scrollY);
      }
    };
    if (searchable) {
      setInputValue(option.label);
    }
    onChange(option.value);
    close();
    window.requestAnimationFrame(() => {
      restoreScroll();
      if (!searchable) {
        // Parent may accept the pick without storing it (value stays "").
        // Sync label from the controlled value after React commits.
        setInputValue(getLabelForValue(optionsRef.current, safeValueRef.current));
      }
      window.requestAnimationFrame(restoreScroll);
    });
  };

  const handleBlur = () => {
    if (!searchable) return;

    const trimmed = (inputValue ?? "").trim();

    if (!trimmed) {
      setInputValue("");
      if (safeValue) onChange("");
      return;
    }

    const matched = options.find((option) => option.label.toLowerCase() === trimmed.toLowerCase());

    if (matched) {
      setInputValue(matched.label);
      if (matched.value !== safeValue) onChange(matched.value);
      return;
    }

    if (allowCustomValue) {
      if (trimmed !== safeValue) onChange(trimmed);
      return;
    }

    setInputValue(getLabelForValue(options, safeValue));
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (selectableOptions.length === 0) return;

    setActiveOptionValue((current) => {
      if (!current) {
        return direction > 0
          ? selectableOptions[0].value
          : selectableOptions[selectableOptions.length - 1].value;
      }

      const currentIndex = selectableOptions.findIndex((option) => option.value === current);
      if (currentIndex < 0) {
        return direction > 0
          ? selectableOptions[0].value
          : selectableOptions[selectableOptions.length - 1].value;
      }

      const nextIndex = (currentIndex + direction + selectableOptions.length) % selectableOptions.length;
      return selectableOptions[nextIndex].value;
    });
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      moveActiveOption(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      moveActiveOption(-1);
      return;
    }

    if (event.key === "Enter") {
      if (selectableOptions.length === 0) return;
      event.preventDefault();
      const optionToPick =
        selectableOptions.find((option) => option.value === activeOptionValue) ?? selectableOptions[0];
      handleOptionPick(optionToPick);
    }
  };

  useEffect(() => {
    if (!isOpen || !activeOptionValue || !listRef.current) return;
    const list = listRef.current;
    const activeNode = list.querySelector<HTMLButtonElement>(
      `[data-option-value="${CSS.escape(activeOptionValue)}"]`,
    );
    if (!activeNode) return;

    // Avoid Element.scrollIntoView — in Safari it can scroll the document
    // (including to the top) when the list is portaled with position:fixed.
    const optionTop = activeNode.offsetTop;
    const optionBottom = optionTop + activeNode.offsetHeight;
    if (optionTop < list.scrollTop) {
      list.scrollTop = optionTop;
    } else if (optionBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = optionBottom - list.clientHeight;
    }
  }, [activeOptionValue, isOpen]);

  const showPlaceholderState = !safeValue && !(inputValue ?? "").trim();
  const handleControlMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const target = event.target as HTMLElement;
    if (target.closest(".site-select__chevron") || target.closest(".site-select__clear")) {
      return;
    }
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  };

  const handleClear = () => {
    if (isDisabled) return;
    setInputValue("");
    onInputChange?.("");
    onChange("");
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  };

  const handleListScroll = () => {
    if (!onListEndReached || !listRef.current) return;
    const node = listRef.current;
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (remaining <= 24) {
      onListEndReached();
    }
  };

  const list = isOpen ? (
    <div
      ref={listRootRef}
      className={`site-select__list${className ? ` ${className}` : ""}`}
      style={listStyle}
      onWheel={(event) => event.stopPropagation()}
    >
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        className="site-select__list-inner"
        onScroll={handleListScroll}
      >
        {visibleOptions.length > 0 ? (
          visibleOptions.map((option, index) => (
            <li key={option.value} role="presentation">
              {option.disabled ? (
                <span
                  className={`site-select__group-label${index > 0 ? " site-select__group-label--with-divider" : ""}`}
                >
                  {option.label}
                </span>
              ) : (
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === safeValue}
                  className={`site-select__option${option.value === safeValue ? " is-selected" : ""}${option.value === activeOptionValue ? " is-active" : ""}`}
                  data-option-value={option.value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleOptionPick(option)}
                  onMouseEnter={() => setActiveOptionValue(option.value)}
                >
                  {option.label}
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="site-select__empty" role="presentation">
            Ничего не найдено
          </li>
        )}
      </ul>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`site-select site-select--${variant}${className ? ` ${className}` : ""}${isOpen ? " is-open" : ""}${isDisabled ? " is-disabled" : ""}`}
    >
      <div className="site-select__control" onMouseDown={handleControlMouseDown}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          value={inputValue ?? ""}
          placeholder={placeholder}
          readOnly={!searchable}
          disabled={isDisabled || undefined}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => !isDisabled && setIsOpen(true)}
          onBlur={handleBlur}
          onMouseDown={(event) => {
            if (!searchable) {
              event.preventDefault();
            }
          }}
          className={`site-select__input${showPlaceholderState ? " is-placeholder" : ""}${!searchable ? " is-readonly-select" : ""}`}
        />
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Очистить"
            className="site-select__clear"
            disabled={isDisabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            <ClearIcon />
          </button>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            aria-label={isOpen ? "Скрыть варианты" : "Показать варианты"}
            className="site-select__chevron"
            disabled={isDisabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => !isDisabled && setIsOpen((current) => !current)}
          >
            <ChevronIcon open={isOpen} />
          </button>
        )}
      </div>

      {mounted && list ? createPortal(list, document.body) : null}
    </div>
  );
}
