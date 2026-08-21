import type { IconProps } from "./types";

export const BURGER_ICON_SIZE = { width: 14, height: 11 } as const;

export function BurgerIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={BURGER_ICON_SIZE.width}
      height={BURGER_ICON_SIZE.height}
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path d="M1 1H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1 7H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1 13H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
