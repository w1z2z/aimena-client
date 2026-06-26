import type { IconProps } from "./types";

export function EyeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1.5 9.5C1.5 9.5 4 3.5 9.5 3.5C15 3.5 17.5 9.5 17.5 9.5C17.5 9.5 15 15.5 9.5 15.5C4 15.5 1.5 9.5 1.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
