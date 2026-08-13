import { useId } from "react";

import type { IconProps } from "./types";

export function DealCancelIcon({ className, ...props }: IconProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `deal_cancel_star_${reactId}`;

  return (
    <svg
      width={68}
      height={68}
      viewBox="0 0 40 40"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M35.1181 0.367809C37.7331 -1.02683 40.5715 1.81154 39.1769 4.42661L31.7463 18.3595C31.2758 19.2419 31.2758 20.3006 31.7463 21.183L39.1769 35.1159C40.5715 37.7309 37.7331 40.5693 35.1181 39.1747L21.1852 31.7441C20.3028 31.2736 19.244 31.2736 18.3617 31.7441L4.4288 39.1747C1.81374 40.5693 -1.02465 37.731 0.369989 35.1159L7.80055 21.183C8.27111 20.3006 8.27111 19.2419 7.80055 18.3595L0.369996 4.42661C-1.02464 1.81155 1.81373 -1.02683 4.42879 0.367805L18.3617 7.79837C19.244 8.26892 20.3028 8.26892 21.1852 7.79837L35.1181 0.367809Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="2.27344"
          y1="1.18799"
          x2="32.2734"
          y2="37.188"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#FF2056" />
        </linearGradient>
      </defs>
    </svg>
  );
}
