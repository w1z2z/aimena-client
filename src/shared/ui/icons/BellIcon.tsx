import type { IconProps } from "./types";

export const BELL_ICON_SIZE = { width: 20, height: 20 } as const;

/** Hugeicons-style notification / bell stroke rounded */
export function BellIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={BELL_ICON_SIZE.width}
      height={BELL_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M18.75 9.71V9C18.75 5.27208 15.7279 2.25 12 2.25C8.27208 2.25 5.25 5.27208 5.25 9V9.71C5.25 10.615 4.9858 11.5 4.49398 12.2512L3.5951 13.6227C2.40685 15.4362 3.2798 17.8912 5.33186 18.3523C10.2944 19.4699 13.7056 19.4699 18.6681 18.3523C20.7202 17.8912 21.5931 15.4362 20.4049 13.6227L19.506 12.2512C19.0142 11.5 18.75 10.615 18.75 9.71Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18.75C9.492 20.039 10.644 21 12 21C13.356 21 14.508 20.039 15 18.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
