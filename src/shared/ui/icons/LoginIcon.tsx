import type { IconProps } from "./types";

export const LOGIN_ICON_SIZE = { width: 20, height: 20 } as const;

/** Door + arrow out (exit / login trigger) — stroke rounded */
export function LoginIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={LOGIN_ICON_SIZE.width}
      height={LOGIN_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M15 17.625C14.8776 19.9073 12.9216 21.75 10.5 21.75H7.5C4.60051 21.75 2.25 19.3995 2.25 16.5V7.5C2.25 4.60051 4.60051 2.25 7.5 2.25H10.5C12.9216 2.25 14.8776 4.0927 15 6.375"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M21 12H9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 8.25L21.75 12L18 15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
