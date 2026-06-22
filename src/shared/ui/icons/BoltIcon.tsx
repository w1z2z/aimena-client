import type { IconProps } from "./types";

export function BoltIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 15.4656 24.4428" fill="none" aria-hidden className={className} {...props}>
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
