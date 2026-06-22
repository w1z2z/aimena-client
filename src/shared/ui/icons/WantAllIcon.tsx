import { useId } from "react";

import type { IconProps } from "./types";

type TabIconProps = IconProps & {
  active?: boolean;
};

export function WantAllIcon({ active, className, ...props }: TabIconProps) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M7.38184 0.46875C7.67451 0.177096 8.14775 0.177096 8.44043 0.46875L10.2539 2.27539C10.4534 2.47414 10.7144 2.59975 10.9941 2.63184L13.5381 2.92285C13.9486 2.96983 14.2437 3.34035 14.1982 3.75098L13.916 6.2959C13.885 6.57573 13.9493 6.85798 14.0986 7.09668L15.457 9.26758C15.6762 9.61781 15.5711 10.0794 15.2217 10.2998L13.0566 11.666C12.8185 11.8163 12.6375 12.042 12.5439 12.3076L11.6943 14.7227C11.5572 15.1124 11.1304 15.3183 10.7402 15.1826L8.32227 14.3408C8.05624 14.2483 7.76603 14.2483 7.5 14.3408L5.08203 15.1826C4.69182 15.3183 4.26507 15.1124 4.12793 14.7227L3.27832 12.3076C3.1848 12.042 3.0038 11.8163 2.76562 11.666L0.600586 10.2998C0.251133 10.0794 0.146061 9.61781 0.365234 9.26758L1.72363 7.09668C1.87293 6.85798 1.93728 6.57573 1.90625 6.2959L1.62402 3.75098C1.57854 3.34035 1.87371 2.96983 2.28418 2.92285L4.82812 2.63184C5.10786 2.59975 5.36891 2.47414 5.56836 2.27539L7.38184 0.46875Z"
        fill={active ? "white" : `url(#${gradientId})`}
        stroke="white"
        strokeWidth="0.5"
      />
      {!active && (
        <defs>
          <linearGradient id={gradientId} x1="5.78613" y1="4.68789" x2="21.0861" y2="20.8379" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8E8BED" />
            <stop offset="1" stopColor="#C8FF00" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
