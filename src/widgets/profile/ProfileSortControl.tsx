"use client";

import { useRef, useState, type CSSProperties } from "react";

import { useDropdownDismiss } from "@/shared/lib/dropdown-anchor";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";

export type ProfileSortOrder = "newest" | "oldest";

/** Own-profile listing type filter (no «Удаленные», no drafts). */
export type ProfileListingTypeFilter = "all" | "active" | "completed" | "archived";

/** Deal history type filter (only finished deals: successful or cancelled). */
export type ProfileDealTypeFilter = "all" | "successful" | "cancelled";

export const PROFILE_LISTING_TYPE_OPTIONS: Array<{
  value: ProfileListingTypeFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Снятые с публикации" },
  { value: "completed", label: "Завершенные" },
];

/** Public profile: no paused/archived listings in the type filter. */
export type PublicProfileListingTypeFilter = "all" | "active" | "completed";

export const PUBLIC_LISTING_TYPE_OPTIONS: Array<{
  value: PublicProfileListingTypeFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершенные" },
];

export const PROFILE_DEAL_TYPE_OPTIONS: Array<{
  value: ProfileDealTypeFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  { value: "successful", label: "Успешные" },
  { value: "cancelled", label: "Отмененные" },
];

const SORT_OPTIONS = [
  { id: "newest" as const, label: "Сначала новые" },
  { id: "oldest" as const, label: "Сначала старые" },
];

function SortChevron({ open }: { open: boolean }) {
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

type ProfileSortControlProps<T extends string = string> = {
  sort: ProfileSortOrder;
  onSortChange: (next: ProfileSortOrder) => void;
  /** When set with onTypeChange + typeOptions, popup includes «По типу». */
  typeFilter?: T;
  onTypeChange?: (next: T) => void;
  typeOptions?: ReadonlyArray<{ value: T; label: string }>;
  dialogLabel?: string;
};

export function ProfileSortControl<T extends string = string>({
  sort,
  onSortChange,
  typeFilter,
  onTypeChange,
  typeOptions,
  dialogLabel = "Сортировка",
}: ProfileSortControlProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isRendered, isVisible } = useOverlayPresence(open);
  const activeSortIndex = sort === "oldest" ? 1 : 0;
  const showTypeSection =
    typeFilter !== undefined && Boolean(onTypeChange) && Boolean(typeOptions?.length);

  const close = () => setOpen(false);

  useDropdownDismiss(open, close, rootRef);

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
        className="profile-sort-btn"
      >
        Сортировка
        <SortChevron open={open} />
      </button>

      {isRendered ? (
        <div
          className="absolute right-0 top-full z-50 pt-2"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            role="dialog"
            aria-label={dialogLabel}
            aria-hidden={!isVisible}
            className={`profile-sort-popup overlay-pop overlay-pop--origin-right${isVisible ? " is-open" : ""}`}
          >
            <p className="profile-sort-popup__section-label">По порядку:</p>
            <div
              className="profile-sort-switch"
              role="radiogroup"
              aria-label="Порядок"
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

            {showTypeSection && typeOptions ? (
              <>
                <p className="profile-sort-popup__section-label">По типу:</p>
                <div role="listbox" aria-label="Тип" className="profile-sort-popup__type-list">
                  {typeOptions.map((option) => {
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
                        className={`profile-sort-popup__type-btn${isActive ? " is-active" : ""}`}
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
