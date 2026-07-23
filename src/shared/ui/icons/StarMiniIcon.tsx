import { useId } from "react";

import type { IconProps } from "./types";

export function StarMiniIcon({ className, ...props }: IconProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M23.5585 2.81698C26.753 -0.938857 32.5517 -0.93885 35.7462 2.81698L44.8608 13.5331C45.1394 13.8607 45.444 14.1653 45.7716 14.4439L56.4877 23.5585C60.2435 26.753 60.2435 32.5517 56.4877 35.7462L45.7716 44.8608C45.444 45.1394 45.1394 45.444 44.8608 45.7716L35.7462 56.4877C32.5517 60.2435 26.753 60.2435 23.5585 56.4877L14.4439 45.7716C14.1653 45.444 13.8607 45.1394 13.5331 44.8608L2.81698 35.7462C-0.938857 32.5517 -0.93885 26.753 2.81698 23.5585L13.5331 14.4439C13.8607 14.1653 14.1653 13.8607 14.4439 13.5331L23.5585 2.81698Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="21.1523"
          y1="16.0523"
          x2="82.3523"
          y2="80.6523"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
