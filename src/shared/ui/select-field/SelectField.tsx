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

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

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

const LIST_MAX_HEIGHT = 280;
const LIST_GAP = 4;

type ListPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
};

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

/** iOS keyboard moves the visual viewport; fixed UI must follow offsetTop/Left. */
function measureListPosition(control: HTMLElement): ListPosition {
  const rect = control.getBoundingClientRect();
  const vv = window.visualViewport;
  const viewTop = vv?.offsetTop ?? 0;
  const viewLeft = vv?.offsetLeft ?? 0;
  const viewHeight = vv?.height ?? window.innerHeight;
  const viewBottom = viewTop + viewHeight;

  // rect is visual-viewport-relative; position:fixed is layout-viewport-relative.
  const controlTop = rect.top + viewTop;
  const controlBottom = rect.bottom + viewTop;
  const controlLeft = rect.left + viewLeft;

  const spaceBelow = viewBottom - controlBottom - LIST_GAP;
  const spaceAbove = controlTop - viewTop - LIST_GAP;
  const placeAbove = spaceBelow < Math.min(LIST_MAX_HEIGHT, 160) && spaceAbove > spaceBelow;
  const available = placeAbove ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(120, Math.min(LIST_MAX_HEIGHT, available));

  if (placeAbove) {
    return {
      top: Math.max(viewTop + LIST_GAP, controlTop - LIST_GAP - maxHeight),
      left: controlLeft,
      width: rect.width,
      maxHeight,
      placement: "above",
    };
  }

  return {
    top: controlBottom + LIST_GAP,
    left: controlLeft,
    width: rect.width,
    maxHeight,
    placement: "below",
  };
}

function pinWindowScroll(scrollX: number, scrollY: number) {
  if (Math.abs(window.scrollX - scrollX) > 0.5 || Math.abs(window.scrollY - scrollY) > 0.5) {
    window.scrollTo(scrollX, scrollY);
  }
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
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const { isRendered: isListRendered, isVisible: isListVisible } = useOverlayPresence(isOpen);
  const [inputValue, setInputValue] = useState(() => getLabelForValue(options, safeValue));
  const [activeOptionValue, setActiveOptionValue] = useState<string | null>(null);
  const [listPosition, setListPosition] = useState<ListPosition | null>(null);
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
    const control = rootRef.current;
    if (!control) return;
    setListPosition(measureListPosition(control));
  }, []);

  useLayoutEffect(() => {
    if (!isListRendered) {
      setListPosition(null);
      return;
    }
    updateListPosition();
  }, [isListRendered, updateListPosition, visibleOptions.length]);

  useEffect(() => {
    if (!isListRendered) return;

    const handleReposition = () => {
      updateListPosition();
    };

    window.addEventListener("resize", handleReposition);
    // Keep list glued to the field while nested containers (filters modal) scroll.
    window.addEventListener("scroll", handleReposition, true);
    window.visualViewport?.addEventListener("resize", handleReposition);
    window.visualViewport?.addEventListener("scroll", handleReposition);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      window.visualViewport?.removeEventListener("resize", handleReposition);
      window.visualViewport?.removeEventListener("scroll", handleReposition);
    };
  }, [isListRendered, updateListPosition]);

  /** Same as onboarding: don't let iOS yank the page — list is portaled to the field. */
  const pinScrollAroundFocus = useCallback(() => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const pin = () => {
      pinWindowScroll(scrollX, scrollY);
      updateListPosition();
    };
    pin();
    window.requestAnimationFrame(() => {
      pin();
      window.requestAnimationFrame(pin);
    });
    for (const delay of [50, 100, 200, 280, 360]) {
      window.setTimeout(pin, delay);
    }
  }, [updateListPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRootRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
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

    const windowScrollY = window.scrollY;
    const windowScrollX = window.scrollX;
    const nestedScrolls: { el: HTMLElement; top: number }[] = [];
    let node: HTMLElement | null = rootRef.current;
    while (node) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        nestedScrolls.push({ el: node, top: node.scrollTop });
      }
      node = node.parentElement;
    }

    const restoreScroll = () => {
      if (Math.abs(window.scrollY - windowScrollY) > 0.5) {
        window.scrollTo(windowScrollX, windowScrollY);
      }
      for (const { el, top } of nestedScrolls) {
        if (Math.abs(el.scrollTop - top) > 0.5) {
          el.scrollTop = top;
        }
      }
    };

    setInputValue(option.label);
    onChange(option.value);
    close();

    // Safari scrolls focused controls into view when layout changes
    // (e.g. subcategory panel open). Blur first, then keep scroll pinned.
    inputRef.current?.blur();

    restoreScroll();
    window.requestAnimationFrame(() => {
      restoreScroll();
      window.requestAnimationFrame(restoreScroll);
    });
    // Cover delayed Safari focus-scroll + panel open animation (~260ms)
    for (const delay of [0, 16, 50, 100, 200, 280, 360]) {
      window.setTimeout(restoreScroll, delay);
    }
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
      pinScrollAroundFocus();
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
      pinScrollAroundFocus();
    });
  };

  const handleInputFocus = () => {
    if (isDisabled) return;
    setIsOpen(true);
    pinScrollAroundFocus();
  };

  const handleListScroll = () => {
    if (!onListEndReached || !listRef.current) return;
    const node = listRef.current;
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (remaining <= 24) {
      onListEndReached();
    }
  };

  const listStyle: CSSProperties | undefined = listPosition
    ? {
        top: listPosition.top,
        left: listPosition.left,
        width: listPosition.width,
        maxHeight: listPosition.maxHeight,
      }
    : undefined;

  const listNode =
    isListRendered && typeof document !== "undefined" ? (
      <div
        ref={listRootRef}
        className={`site-select__list site-select__list--portal overlay-pop${isListVisible ? " is-open" : ""}${listPosition?.placement === "above" ? " is-above" : ""}${className ? ` ${className}` : ""}`}
        style={listStyle}
        aria-hidden={!isListVisible}
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
          onFocus={handleInputFocus}
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

      {listNode ? createPortal(listNode, document.body) : null}
    </div>
  );
}
