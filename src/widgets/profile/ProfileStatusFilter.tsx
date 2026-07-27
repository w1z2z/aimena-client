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
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-7 items-center justify-center gap-2 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-3 py-2"
      >
        <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.001em] text-[#1A1A1A]">
          {currentLabel}
        </span>
        <img
          src={PROFILE_ASSETS.sortChevron}
          alt=""
          className={`h-1 w-2 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 box-border flex w-[220px] flex-col gap-1 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white p-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-[34px] w-full items-center rounded-[13px] px-3 text-left text-[14px] font-semibold leading-[1.2] tracking-[0.001em] ${
                  isActive ? "bg-[#1A1A1A] text-white" : "bg-transparent text-[#1A1A1A] hover:bg-[#F2F4F7]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
