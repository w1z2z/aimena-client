/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

import { PROFILE_ASSETS } from "./constants";

export type ProfileListingStatusFilter = "all" | "active" | "archived";

const STATUS_OPTIONS: Array<{ value: ProfileListingStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Завершённые" },
];

type ProfileStatusFilterProps = {
  value: ProfileListingStatusFilter;
  onChange: (next: ProfileListingStatusFilter) => void;
};

export function ProfileStatusFilter({ value, onChange }: ProfileStatusFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentLabel =
    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? "Все";

  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // click (not mousedown): avoid racing with the opening button press
    window.addEventListener("click", onOutsideClick);
    return () => window.removeEventListener("click", onOutsideClick);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="profile-status-filter relative overflow-visible"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="flex h-7 items-center justify-center gap-2 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-3 py-2"
      >
        <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
          {currentLabel}
        </span>
        <img
          src={PROFILE_ASSETS.sortChevron}
          alt=""
          className={`h-1 w-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 pt-2"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            role="listbox"
            aria-label="Статус объявлений"
            className="box-border flex w-[220px] flex-col gap-1 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            {STATUS_OPTIONS.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    if (option.value === value) return;
                    onChange(option.value);
                  }}
                  className={`flex h-[34px] w-full items-center rounded-[13px] px-3 text-left text-[14px] font-semibold leading-[1.2] tracking-[0.001em] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-transparent text-[#1A1A1A] hover:bg-[#F2F4F7]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
