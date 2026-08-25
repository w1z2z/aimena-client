import type { IconProps } from "./types";

export const BELL_ICON_SIZE = { width: 14, height: 15 } as const;

/** assets/notice.svg */
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
        d="M15.4625 17.6726H8.53437M15.4625 17.6726H19.6079C21.7597 17.6726 21.3961 15.5391 20.3076 14.4563C16.387 10.5621 21.9559 1.61401 11.9984 1.61401C2.04097 1.61401 7.611 10.5609 3.69042 14.4563C2.64317 15.4978 2.19697 17.6726 4.39011 17.6726H8.53437M15.4625 17.6726C15.4625 19.8806 14.7192 22.2607 11.9984 22.2607C9.27765 22.2607 8.53437 19.8806 8.53437 17.6726"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
