import type { IconProps } from "./types";

export const EYE_OFF_ICON_SIZE = { width: 19, height: 19 } as const;

export function EyeOffIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={EYE_OFF_ICON_SIZE.width}
      height={EYE_OFF_ICON_SIZE.height}
      viewBox={`0 0 ${EYE_OFF_ICON_SIZE.width} ${EYE_OFF_ICON_SIZE.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M1.5 9.5C1.5 9.5 4 3.5 9.5 3.5C15 3.5 17.5 9.5 17.5 9.5C17.5 9.5 15 15.5 9.5 15.5C4 15.5 1.5 9.5 1.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 2.5L16.5 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
