import type { IconProps } from "./types";

export const LOGIN_ICON_SIZE = { width: 16, height: 16 } as const;

export function LoginIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={LOGIN_ICON_SIZE.width}
      height={LOGIN_ICON_SIZE.height}
      viewBox={`0 0 ${LOGIN_ICON_SIZE.width} ${LOGIN_ICON_SIZE.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M6 2.5H3.5C2.67157 2.5 2 3.17157 2 4V12C2 12.8284 2.67157 13.5 3.5 13.5H6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10.5 11L14 7.5L10.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 7.5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
