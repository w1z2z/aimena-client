import type { IconProps } from "./types";

export const AUTH_STAR_ICON_SIZE = { width: 138, height: 138 } as const;

export function AuthStarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_STAR_ICON_SIZE.width}
      height={AUTH_STAR_ICON_SIZE.height}
      viewBox={`0 0 ${AUTH_STAR_ICON_SIZE.width} ${AUTH_STAR_ICON_SIZE.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M69 12L82.5 48.5L121 52L91.5 77L100 115.5L69 96L38 115.5L46.5 77L17 52L55.5 48.5L69 12Z"
        fill="url(#auth_star_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_star_gradient"
          x1="17"
          y1="12"
          x2="121"
          y2="115.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="0.5" stopColor="#A987BD" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
