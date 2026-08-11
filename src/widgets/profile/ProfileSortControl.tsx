/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { PROFILE_ASSETS } from "./constants";

export type ProfileSortOrder = "newest" | "oldest";

/** Own-profile type filter (no «Удаленные»). */
export type ProfileListingTypeFilter = "all" | "active" | "completed" | "archived";

type ProfileSortControlProps = {
  sort: ProfileSortOrder;
  onSortChange: (next: ProfileSortOrder) => void;
  /** When set with onTypeChange, popup includes «По типу». */
  typeFilter?: ProfileListingTypeFilter;
  onTypeChange?: (next: ProfileListingTypeFilter) => void;
};

const SORT_OPTIONS = [
  { id: "newest" as const, label: "Сначала новые" },
  { id: "oldest" as const, label: "Сначала старые" },
];

const TYPE_OPTIONS: Array<{ value: ProfileListingTypeFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Снятые с публикации" },
  { value: "completed", label: "Завершенные" },
];

export function ProfileSortControl({
  sort,
  onSortChange,
  typeFilter,
  onTypeChange,
}: ProfileSortControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeSortIndex = sort === "oldest" ? 1 : 0;
  const showTypeSection = typeFilter !== undefined && Boolean(onTypeChange);

  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("click", onOutsideClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onOutsideClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="profile-sort-control relative overflow-visible"
      style={{ viewTransitionName: "none" } as CSSProperties}
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
          <div
            role="dialog"
            aria-label="Сортировка объявлений"
            className="profile-sort-popup box-border flex w-[326px] flex-col items-start justify-center gap-3 rounded-[31px] border-[0.5px] border-solid border-[#8E8BED] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">По порядку:</p>
            <div
              className="profile-sort-switch"
              role="radiogroup"
              aria-label="Порядок объявлений"
              data-active-index={activeSortIndex}
            >
              <span
                aria-hidden
                className="profile-sort-switch__indicator"
                style={{ transform: `translateX(calc(${activeSortIndex} * (100% + 4px)))` }}
              />
              {SORT_OPTIONS.map((option) => {
                const active = sort === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      if (option.id === sort) return;
                      onSortChange(option.id);
                    }}
                    className={`profile-sort-switch__btn${active ? " is-active" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {showTypeSection ? (
              <>
                <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">По типу:</p>
                <div
                  role="listbox"
                  aria-label="Тип объявлений"
                  className="flex w-[278px] flex-col gap-3"
                >
                  {TYPE_OPTIONS.map((option) => {
                    const isActive = typeFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          if (option.value === typeFilter) return;
                          onTypeChange?.(option.value);
                        }}
                        className={`flex h-[34px] w-full shrink-0 items-center rounded-[13px] px-3 text-left text-[14px] font-semibold leading-[1.2] tracking-[0.001em] transition-colors duration-200 ${
                          isActive
                            ? "border-[0.5px] border-solid border-[#8E8BED] bg-[#8E8BED] text-white"
                            : "border-[0.5px] border-solid border-transparent bg-white text-[#1A1A1A] hover:bg-[#F2F4F7]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
