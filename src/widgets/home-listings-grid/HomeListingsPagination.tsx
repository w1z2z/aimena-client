"use client";

import { useCallback, useMemo } from "react";

const TOTAL_ITEMS = 2304;
const ITEMS_PER_PAGE = 12;

type PageToken = number | "ellipsis";

function getPaginationTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PageToken[] = [1];

  if (currentPage > 3) {
    tokens.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (currentPage < totalPages - 2) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);
  return tokens;
}

function PaginationArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      className="home-listings-pagination__arrow"
      aria-label={isPrev ? "Предыдущая страница" : "Следующая страница"}
      disabled={disabled}
      onClick={onClick}
    >
      <svg viewBox="0 0 16 26" fill="none" aria-hidden className={isPrev ? "is-prev" : ""}>
        <path
          d="M1 1L14 13L1 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type HomeListingsPaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function HomeListingsPagination({ currentPage, onPageChange }: HomeListingsPaginationProps) {
  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);

  const tokens = useMemo(
    () => getPaginationTokens(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      onPageChange(page);
    },
    [currentPage, onPageChange, totalPages],
  );

  return (
    <nav className="home-listings-pagination" aria-label="Пагинация объявлений">
      <PaginationArrow
        direction="prev"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      />

      <div className="home-listings-pagination__pages">
        {tokens.map((token, index) =>
          token === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="home-listings-pagination__ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={token}
              type="button"
              className={`home-listings-pagination__page${token === currentPage ? " is-active" : ""}`}
              aria-label={`Страница ${token}`}
              aria-current={token === currentPage ? "page" : undefined}
              onClick={() => goToPage(token)}
            >
              {token}
            </button>
          ),
        )}
      </div>

      <PaginationArrow
        direction="next"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
      />
    </nav>
  );
}

export { TOTAL_ITEMS, ITEMS_PER_PAGE };
