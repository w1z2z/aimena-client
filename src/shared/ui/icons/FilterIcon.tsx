import type { IconProps } from "./types";

export const FILTER_ICON_SIZE = { width: 16, height: 14 } as const;

export function FilterIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={FILTER_ICON_SIZE.width}
      height={FILTER_ICON_SIZE.height}
      viewBox={`0 0 ${FILTER_ICON_SIZE.width} ${FILTER_ICON_SIZE.height}`}
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M1 2.5H15M1 7H15M1 11.5H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
      />
      <circle cx="5" cy="2.5" r="1.5" fill="currentColor" />
      <circle cx="11" cy="7" r="1.5" fill="currentColor" />
      <circle cx="7" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  );
}
