/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

import { PROFILE_ASSETS } from "./constants";

type SortOrder = "newest" | "oldest";

type ProfileSortControlProps = {
  value: SortOrder;
  onChange: (next: SortOrder) => void;
};

export function ProfileSortControl({ value, onChange }: ProfileSortControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
          Сортировка
        </span>
        <img
          src={PROFILE_ASSETS.sortChevron}
          alt=""
          className={`h-1 w-2 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 box-border flex h-[112px] w-[326px] flex-col items-start justify-center gap-3 rounded-[31px] border-[0.5px] border-solid border-[#CACACA] bg-white p-6">
          <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">По порядку:</p>
          <div className="box-border flex h-[42px] w-[278px] items-start gap-1 rounded-[15px] bg-[#F2F4F7] p-1">
            <button
              type="button"
              onClick={() => {
                onChange("newest");
                setOpen(false);
              }}
              className={`flex h-[34px] w-[130px] shrink-0 items-center justify-center rounded-[13px] p-3 text-[14px] font-semibold leading-[1.2] tracking-[0.001em] ${
                value === "newest" ? "bg-[#1A1A1A] text-white" : "bg-transparent text-[#1A1A1A]"
              }`}
            >
              Сначала новые
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("oldest");
                setOpen(false);
              }}
              className={`flex h-[34px] w-[136px] shrink-0 items-center justify-center rounded-[13px] p-3 text-[14px] font-semibold leading-[1.2] tracking-[0.001em] ${
                value === "oldest" ? "bg-[#1A1A1A] text-white" : "bg-transparent text-[#1A1A1A]"
              }`}
            >
              Сначала старые
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
