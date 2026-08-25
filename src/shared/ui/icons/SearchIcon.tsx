import type { IconProps } from "./types";

export const SEARCH_ICON_SIZE = { width: 13, height: 13 } as const;

/** assets/search.svg */
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
      <path
        d="M18 18L22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11C20 6.02943 15.9706 2 11 2C6.02943 2 2 6.02943 2 11C2 15.9706 6.02943 20 11 20C15.9706 20 20 15.9706 20 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
