import type { IconProps } from "./types";

export const MENU_SQUARE_ICON_SIZE = { width: 24, height: 24 } as const;

/** 2×2 rounded squares — matches Figma menu-square-stroke-rounded. */
export function MenuSquareIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={MENU_SQUARE_ICON_SIZE.width}
      height={MENU_SQUARE_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="2"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="2"
        y="14"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="14"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
