import type { SVGProps } from "react";

import type { IconProps } from "./types";

export const CHEVRON_ICON_SIZE = { width: 16, height: 26 } as const;

export function ChevronIcon({
  direction = "right",
  className,
  ...props
}: IconProps & { direction?: "left" | "right" }) {
  return (
    <svg
      width={CHEVRON_ICON_SIZE.width}
      height={CHEVRON_ICON_SIZE.height}
      viewBox={`0 0 ${CHEVRON_ICON_SIZE.width} ${CHEVRON_ICON_SIZE.height}`}
      fill="none"
      aria-hidden
      className={`block shrink-0 ${direction === "left" ? "scale-x-[-1]" : ""} ${className ?? ""}`}
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
