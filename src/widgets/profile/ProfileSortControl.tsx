/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

import { PROFILE_ASSETS } from "./constants";

type SortOrder = "newest" | "oldest";

type ProfileSortControlProps = {
  value: SortOrder;
  onChange: (next: SortOrder) => void;
};

const SORT_OPTIONS = [
  { id: "newest" as const, label: "Сначала новые" },
  { id: "oldest" as const, label: "Сначала старые" },
];

export function ProfileSortControl({ value, onChange }: ProfileSortControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeIndex = value === "oldest" ? 1 : 0;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // click (not mousedown): avoid racing with the opening button press
    window.addEventListener("click", onPointerDown);
    return () => window.removeEventListener("click", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="profile-sort-control relative overflow-visible"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="flex h-7 items-center justify-center gap-2 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-3 py-2"
      >
        <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
          Сортировка
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
          <div className="box-border flex h-[112px] w-[326px] flex-col items-start justify-center gap-3 rounded-[31px] border-[0.5px] border-solid border-[#CACACA] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">По порядку:</p>
            <div
              className="profile-sort-switch"
              role="radiogroup"
              aria-label="Порядок объявлений"
              data-active-index={activeIndex}
            >
              <span
                aria-hidden
                className="profile-sort-switch__indicator"
                style={{ transform: `translateX(calc(${activeIndex} * (100% + 4px)))` }}
              />
              {SORT_OPTIONS.map((option) => {
                const active = value === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      if (option.id === value) return;
                      onChange(option.id);
                    }}
                    className={`profile-sort-switch__btn${active ? " is-active" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
