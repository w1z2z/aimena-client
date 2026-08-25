"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

export type ProfileListingStatusFilter = "all" | "active" | "archived" | "completed";

const OWN_STATUS_OPTIONS: Array<{ value: ProfileListingStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Снятые с публикации" },
  { value: "completed", label: "Завершенные" },
];

const PUBLIC_STATUS_OPTIONS: Array<{ value: ProfileListingStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершенные" },
];

type ProfileStatusFilterProps = {
  value: ProfileListingStatusFilter;
  onChange: (next: ProfileListingStatusFilter) => void;
  options?: "own" | "public";
};

function StatusChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileStatusFilter({
  value,
  onChange,
  options = "own",
}: ProfileStatusFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isRendered, isVisible } = useOverlayPresence(open);
  const statusOptions = options === "public" ? PUBLIC_STATUS_OPTIONS : OWN_STATUS_OPTIONS;
  const currentLabel =
    statusOptions.find((option) => option.value === value)?.label ?? "Все";

  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", onOutsideClick);
    return () => window.removeEventListener("click", onOutsideClick);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="profile-status-filter relative overflow-visible"
      style={{ viewTransitionName: "none" } as CSSProperties}
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
        className="flex h-7 items-center justify-center gap-2 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-3 py-2 text-[#1A1A1A]"
      >
        <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.001em]">
          {currentLabel}
        </span>
        <StatusChevron open={open} />
      </button>

      {isRendered ? (
        <div
          className="absolute right-0 top-full z-50 pt-2"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            role="listbox"
            aria-label="Статус объявлений"
            aria-hidden={!isVisible}
            className={`overlay-pop overlay-pop--origin-right box-border flex w-[220px] flex-col gap-1 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]${isVisible ? " is-open" : ""}`}
          >
            {statusOptions.map((option) => {
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
