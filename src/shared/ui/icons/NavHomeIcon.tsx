import type { IconProps } from "./types";

export const NAV_HOME_ICON_SIZE = { width: 20, height: 20 } as const;

/** Mobile bottom nav — home */
export function NavHomeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={NAV_HOME_ICON_SIZE.width}
      height={NAV_HOME_ICON_SIZE.height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H15V14H9V20H5C4.44772 20 4 19.5523 4 19V10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
