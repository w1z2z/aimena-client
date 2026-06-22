import type { IconProps } from "./types";

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 22l2-2-6.5-6zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
        fill="currentColor"
      />
    </svg>
  );
}
