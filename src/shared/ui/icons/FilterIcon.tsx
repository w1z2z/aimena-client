import type { IconProps } from "./types";

export function FilterIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 14" fill="none" aria-hidden className={className} {...props}>
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
