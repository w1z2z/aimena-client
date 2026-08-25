import type { IconProps } from "./types";

export const SEARCH_ICON_SIZE = { width: 20, height: 20 } as const;

/** Hugeicons-style search-01 stroke rounded */
export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={SEARCH_ICON_SIZE.width}
      height={SEARCH_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
