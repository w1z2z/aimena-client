import type { IconProps } from "./types";

export function BellDotIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 5 5" fill="none" aria-hidden className={className} {...props}>
      <circle cx="2.5" cy="2.5" r="2.5" fill="currentColor" />
    </svg>
  );
}
