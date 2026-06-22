"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  wrapClassName?: string;
  inputClassName?: string;
  listClassName?: string;
  optionClassName?: string;
  chevronClassName?: string;
  "aria-label"?: string;
};

function getLabelForValue(options: readonly ComboboxOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ComboboxField({
  value,
  onChange,
  onInputChange,
  options,
  placeholder,
  wrapClassName,
  inputClassName,
  listClassName,
  optionClassName,
  chevronClassName,
  "aria-label": ariaLabel,
}: ComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => getLabelForValue(options, value));
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setInputValue(getLabelForValue(options, value));
  }, [options, value]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [close, isOpen]);

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    onInputChange?.(nextValue);
  };

  const handleOptionPick = (option: ComboboxOption) => {
    setInputValue(option.label);
    onChange(option.value);
    close();
  };

  return (
    <div ref={rootRef} className={`combobox-field${wrapClassName ? ` ${wrapClassName}` : ""}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        value={inputValue}
        placeholder={placeholder}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        className={inputClassName}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Показать варианты"
        className={`combobox-field__chevron${chevronClassName ? ` ${chevronClassName}` : ""}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsOpen((current) => !current)}
      >
        ▼
      </button>
      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          className={`combobox-field__list${listClassName ? ` ${listClassName}` : ""}`}
        >
          {options.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`combobox-field__option${optionClassName ? ` ${optionClassName}` : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleOptionPick(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
