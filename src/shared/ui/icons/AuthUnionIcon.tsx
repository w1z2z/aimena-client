import type { IconProps } from "./types";

export const AUTH_UNION_ICON_SIZE = { width: 160, height: 111 } as const;

export function AuthUnionIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_UNION_ICON_SIZE.width}
      height={AUTH_UNION_ICON_SIZE.height}
      viewBox="0 0 160 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M90.8754 103.997C98.4451 112.647 111.902 112.647 119.472 103.997L135.344 85.8582L153.483 69.9861C162.133 62.4164 162.133 48.9592 153.483 41.3894L135.344 25.5164L119.472 7.37868C111.902 -1.27164 98.4451 -1.27164 90.8754 7.37868L80.3744 19.3787L69.0951 6.48805C61.5253 -2.16203 48.0681 -2.16209 40.4984 6.48805L24.6263 24.6267L6.48766 40.4988C-2.1626 48.0685 -2.1625 61.5257 6.48766 69.0955L24.6263 84.9685L40.4984 103.106C48.0681 111.757 61.5253 111.757 69.0951 103.106L79.5961 91.1072L90.8754 103.997Z"
        fill="url(#auth_union_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_union_gradient"
          x1="84.2743"
          y1="79.0944"
          x2="190.43"
          y2="-12.4439"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
