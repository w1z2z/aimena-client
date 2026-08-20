import { useId } from "react";

import type { IconProps } from "./types";

export const LISTING_ACTION_STAR_SIZE = { width: 59, height: 59 } as const;

export function ListingActionStarIcon({ className, ...props }: IconProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `listing_action_star_${reactId}`;

  return (
    <svg
      width={LISTING_ACTION_STAR_SIZE.width}
      height={LISTING_ACTION_STAR_SIZE.height}
      viewBox="0 0 59 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M25.9269 2.12615C27.43 -0.708956 31.4918 -0.708948 32.995 2.12616L40.6661 16.595C41.0409 17.3021 41.6193 17.8804 42.3264 18.2553L56.7952 25.9264C59.6303 27.4295 59.6303 31.4914 56.7952 32.9945L42.3264 40.6656C41.6193 41.0405 41.0409 41.6188 40.6661 42.3259L32.995 56.7948C31.4918 59.6299 27.43 59.6298 25.9269 56.7947L18.2558 42.3259C17.8809 41.6188 17.3026 41.0405 16.5955 40.6656L2.12664 32.9945C-0.708468 31.4914 -0.708459 27.4295 2.12664 25.9264L16.5955 18.2553C17.3026 17.8804 17.8809 17.3021 18.2558 16.595L25.9269 2.12615Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="20.9609"
          y1="15.8605"
          x2="82.1609"
          y2="80.4604"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#c8ff02" />
        </linearGradient>
      </defs>
    </svg>
  );
}
