import type { IconProps } from "./types";

export const BOLT_ICON_SIZE = { width: 15.4656, height: 24.4428 } as const;

export function BoltIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={BOLT_ICON_SIZE.width}
      height={BOLT_ICON_SIZE.height}
      viewBox={`0 0 ${BOLT_ICON_SIZE.width} ${BOLT_ICON_SIZE.height}`}
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M1 14.4657L8.85492 1.00009V9.97714H14.4656L6.61065 23.4427V14.4657H1Z"
        fill="#C8FF00"
        stroke="#8E8BED"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
