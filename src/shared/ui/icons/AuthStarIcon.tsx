import type { IconProps } from "./types";

export const AUTH_STAR_ICON_SIZE = { width: 108, height: 95 } as const;

export function AuthStarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_STAR_ICON_SIZE.width}
      height={AUTH_STAR_ICON_SIZE.height}
      viewBox="0 0 108 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M48.9675 3.06524C50.6824 -1.02215 56.4738 -1.02216 58.1888 3.06523L76.6372 47.0355C76.8003 47.4244 77.012 47.7911 77.2672 48.1268L106.122 86.0887C108.805 89.6176 105.909 94.6331 101.512 94.0746L54.2082 88.0662C53.7898 88.0131 53.3664 88.0131 52.9481 88.0662L5.6445 94.0746C1.24725 94.6331 -1.64846 89.6176 1.03386 86.0887L29.8891 48.1268C30.1443 47.7911 30.3559 47.4244 30.5191 47.0355L48.9675 3.06524Z"
        fill="url(#auth_star_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_star_gradient"
          x1="36.3281"
          y1="33.4762"
          x2="160.528"
          y2="164.576"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
