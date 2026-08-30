"use client";

import { useLayoutEffect, useRef } from "react";

import { scrollToProfilePanelTitle } from "@/shared/lib/scroll-to-profile-panel";

export const PROFILE_PAGE_SIZE = 9;
/** Favorites / free catalog pages */
export const CATALOG_PAGE_SIZE = 12;

export function getProfilePageCount(total: number, pageSize = PROFILE_PAGE_SIZE) {
  if (total <= 0) return 0;
  return Math.ceil(total / pageSize);
}

function buildPageItems(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push("ellipsis");
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);
  return items;
}

function PaginationArrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="block shrink-0"
    >
      <path
        d={direction === "prev" ? "M8.5 3L4.5 7L8.5 11" : "M5.5 3L9.5 7L5.5 11"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const pageButtonBase =
  "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-[12px] border-[0.5px] border-solid text-[14px] font-semibold leading-none";

type ProfilePaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export function ProfilePagination({ page, pageCount, onChange }: ProfilePaginationProps) {
  const userChangedPageRef = useRef(false);
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!userChangedPageRef.current) return;
    userChangedPageRef.current = false;
    scrollToProfilePanelTitle(navRef.current);
  }, [page]);

  if (pageCount <= 1) return null;

  const items = buildPageItems(page, pageCount);

  const changePage = (next: number) => {
    if (next === page) return;
    userChangedPageRef.current = true;
    onChange(next);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Пагинация"
      className="mt-12 flex w-full items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label="Предыдущая страница"
        disabled={page <= 1}
        onClick={() => changePage(page - 1)}
        className={`${pageButtonBase} border-[#CACACA] bg-white px-0 text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <PaginationArrow direction="prev" />
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-9 min-w-6 items-center justify-center px-1 text-[14px] font-semibold leading-none text-[#626262]"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Страница ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => changePage(item)}
            className={`${pageButtonBase} px-3 ${
              item === page
                ? "border-[#8E8BED] bg-[#8E8BED] text-white"
                : "border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED]"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Следующая страница"
        disabled={page >= pageCount}
        onClick={() => changePage(page + 1)}
        className={`${pageButtonBase} border-[#CACACA] bg-white px-0 text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <PaginationArrow direction="next" />
      </button>
    </nav>
  );
}
