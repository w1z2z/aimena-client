import type { IconProps } from "./types";

export const LOGOUT_ICON_SIZE = { width: 18, height: 18 } as const;

export function LogoutIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={LOGOUT_ICON_SIZE.width}
      height={LOGOUT_ICON_SIZE.height}
      viewBox={`0 0 ${LOGOUT_ICON_SIZE.width} ${LOGOUT_ICON_SIZE.height}`}
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.75L15.75 9L12 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 9H6.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
