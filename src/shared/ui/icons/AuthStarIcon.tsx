import type { IconProps } from "./types";

/** Figma 4-point star — login / register (112×112). */
export const AUTH_STAR_ICON_SIZE = { width: 112, height: 112 } as const;

export function AuthStarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_STAR_ICON_SIZE.width}
      height={AUTH_STAR_ICON_SIZE.height}
      viewBox="0 0 112 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M46.8173 5.31563C50.5751 -1.77212 60.7296 -1.77213 64.4874 5.31563L77.4285 29.7244C78.3657 31.4921 79.8116 32.938 81.5793 33.8753L105.988 46.8163C113.076 50.5741 113.076 60.7286 105.988 64.4864L81.5793 77.4275C79.8116 78.3647 78.3657 79.8106 77.4285 81.5784L64.4874 105.987C60.7296 113.075 50.5751 113.075 46.8173 105.987L33.8762 81.5784C32.939 79.8106 31.4931 78.3647 29.7253 77.4275L5.31661 64.4864C-1.77115 60.7286 -1.77115 50.5741 5.31661 46.8163L29.7253 33.8753C31.4931 32.938 32.939 31.4921 33.8762 29.7244L46.8173 5.31563Z"
        fill="url(#auth_star_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_star_gradient"
          x1="38.9023"
          y1="28.8514"
          x2="159.502"
          y2="156.151"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#c8ff02" />
        </linearGradient>
      </defs>
    </svg>
  );
}
