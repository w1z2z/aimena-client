import type { IconProps } from "./types";

export const BELL_DOT_ICON_SIZE = { width: 5, height: 5 } as const;

export function BellDotIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={BELL_DOT_ICON_SIZE.width}
      height={BELL_DOT_ICON_SIZE.height}
      viewBox={`0 0 ${BELL_DOT_ICON_SIZE.width} ${BELL_DOT_ICON_SIZE.height}`}
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <circle cx="2.5" cy="2.5" r="2.5" fill="currentColor" />
    </svg>
  );
}
