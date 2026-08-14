import { useId } from "react";

import type { IconProps } from "./types";

export const RATING_STAR_ICON_SIZE = { width: 17, height: 17 } as const;

export function RatingStarIcon({ className, ...props }: IconProps) {
  const gradientId = `rating_star_${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={RATING_STAR_ICON_SIZE.width}
      height={RATING_STAR_ICON_SIZE.height}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      overflow="visible"
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M6.79004 1.09375C7.45396 0.110797 8.90148 0.110828 9.56543 1.09375L11.7568 4.33887C11.8257 4.44081 11.9137 4.52883 12.0156 4.59766L15.2607 6.78906C16.2438 7.45298 16.2437 8.90051 15.2607 9.56445L12.0156 11.7559C11.9137 11.8247 11.8257 11.9127 11.7568 12.0146L9.56543 15.2598C8.90149 16.2428 7.45396 16.2428 6.79004 15.2598L4.59863 12.0146C4.52981 11.9127 4.44179 11.8247 4.33984 11.7559L1.09473 9.56445C0.111802 8.90051 0.111776 7.45299 1.09473 6.78906L4.33984 4.59766C4.44178 4.52883 4.5298 4.44081 4.59863 4.33887L6.79004 1.09375Z"
        fill={`url(#${gradientId})`}
        stroke="#8E8BED"
        strokeWidth="0.714088"
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="-0.322266"
          y1="8.1768"
          x2="16.6778"
          y2="8.1768"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
