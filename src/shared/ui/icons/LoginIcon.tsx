import type { IconProps } from "./types";

export const LOGIN_ICON_SIZE = { width: 16, height: 16 } as const;

/** assets/exit.svg — login / enter */
export function LoginIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={LOGIN_ICON_SIZE.width}
      height={LOGIN_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 rotate-180 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M15 7L10 12L15 17M10 12H22M10 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
