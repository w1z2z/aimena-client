import { useId } from "react";

import type { IconProps } from "./types";

export function ExchangeBadgeIcon({ className, ...props }: IconProps) {
  const id = useId();

  return (
    <svg viewBox="0 0 59 49" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M20.7853 3.12559C21.7949 1.6303 23.9964 1.63031 25.006 3.1256L29.2411 9.39801C29.4235 9.66828 29.6562 9.90099 29.9265 10.0835L36.1989 14.3185C37.6942 15.3281 37.6942 17.5296 36.1989 18.5392L29.9265 22.7743C29.6562 22.9567 29.4235 23.1895 29.2411 23.4597L25.006 29.7321C23.9964 31.2274 21.7949 31.2274 20.7853 29.7321L16.5503 23.4597C16.3678 23.1895 16.1351 22.9567 15.8648 22.7743L9.59239 18.5392C8.0971 17.5296 8.0971 15.3281 9.59239 14.3185L15.8648 10.0835C16.1351 9.90099 16.3678 9.66828 16.5503 9.39801L20.7853 3.12559Z"
        fill={`url(#${id}-paint0)`}
      />
      <path
        d="M40.3104 18.3258C41.3515 16.8523 43.5525 16.8991 44.5301 18.4155L48.6308 24.7765C48.8075 25.0506 49.0352 25.2882 49.3016 25.4764L55.4825 29.8439C56.956 30.885 56.9092 33.086 55.3928 34.0636L49.0318 38.1643C48.7577 38.341 48.5201 38.5688 48.3319 38.8351L43.9644 45.0161C42.9233 46.4895 40.7223 46.4427 39.7447 44.9263L35.644 38.5653C35.4673 38.2912 35.2396 38.0536 34.9732 37.8654L28.7923 33.498C27.3188 32.4568 27.3656 30.2558 28.882 29.2782L35.243 25.1775C35.5171 25.0008 35.7547 24.7731 35.9429 24.5067L40.3104 18.3258Z"
        fill={`url(#${id}-paint1)`}
      />
      <path
        d="M18.5791 41.8845C20.7466 41.4163 22.914 40.948 24.2331 40.6299C25.5523 40.3117 25.9575 40.1579 26.375 39.9995"
        stroke={`url(#${id}-paint2)`}
        strokeWidth="1.35362"
        strokeLinecap="round"
      />
      <path
        d="M0.67682 28.6822C2.78409 27.992 4.89135 27.3017 6.17045 26.8487C7.44956 26.3956 7.83664 26.2007 8.23545 25.9998"
        stroke={`url(#${id}-paint3)`}
        strokeWidth="1.35362"
        strokeLinecap="round"
      />
      <path
        d="M24.3211 42.9705C24.4255 42.9581 24.5299 42.9458 25.8992 42.6514C27.2685 42.357 29.8995 41.7809 32.6102 41.1874"
        stroke={`url(#${id}-paint4)`}
        strokeWidth="1.35362"
        strokeLinecap="round"
      />
      <path
        d="M6.49924 29.1655C6.60178 29.1424 6.70433 29.1193 8.03574 28.6847C9.36716 28.25 11.9243 27.4046 14.559 26.5335"
        stroke={`url(#${id}-paint5)`}
        strokeWidth="1.35362"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id={`${id}-paint0`} x1="18.7884" y1="9.85732" x2="48.3604" y2="41.0722" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
        <linearGradient id={`${id}-paint1`} x1="38.1708" y1="25.0135" x2="67.0725" y2="56.85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
        <linearGradient id={`${id}-paint2`} x1="21.4661" y1="40.8692" x2="21.858" y2="42.5353" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
        <linearGradient id={`${id}-paint3`} x1="3.44305" y1="27.3733" x2="4.00542" y2="28.9899" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
        <linearGradient id={`${id}-paint4`} x1="27.3991" y1="42.0448" x2="27.6929" y2="43.4441" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
        <linearGradient id={`${id}-paint5`} x1="9.46476" y1="27.926" x2="9.90193" y2="29.2874" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
