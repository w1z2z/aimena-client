import type { SVGProps } from "react";

import type { IconProps } from "./types";

export function ChevronIcon({
  direction = "right",
  className,
  ...props
}: IconProps & { direction?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 26"
      fill="none"
      aria-hidden
      className={`${direction === "left" ? "scale-x-[-1]" : ""} ${className ?? ""}`}
      {...(props as SVGProps<SVGSVGElement>)}
    >
      <path
        d="M1 1L14 13L1 25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
