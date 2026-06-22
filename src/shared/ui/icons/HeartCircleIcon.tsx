import type { IconProps } from "./types";

export function HeartCircleIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className} {...props}>
      <circle cx="16" cy="16" r="16" fill="currentColor" />
    </svg>
  );
}
