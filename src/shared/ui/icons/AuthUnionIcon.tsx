import type { IconProps } from "./types";

/** Figma seal/starburst — confirm email, forgot/reset password (100×110). */
export const AUTH_UNION_ICON_SIZE = { width: 100, height: 110 } as const;

export function AuthUnionIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_UNION_ICON_SIZE.width}
      height={AUTH_UNION_ICON_SIZE.height}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M36.0462 7.52498C42.3119 -2.50822 56.9225 -2.50821 63.1882 7.52499L65.808 11.72C68.627 16.2341 73.5061 19.051 78.8249 19.2353L83.7678 19.4066C95.5897 19.8163 102.895 32.4694 97.3388 42.9123L95.0157 47.2786C92.5159 51.977 92.5159 57.6109 95.0157 62.3092L97.3388 66.6756C102.895 77.1185 95.5897 89.7716 83.7678 90.1813L78.8249 90.3526C73.5061 90.5369 68.627 93.3538 65.808 97.8679L63.1882 102.063C56.9225 112.096 42.3119 112.096 36.0462 102.063L33.4264 97.8679C30.6073 93.3538 25.7283 90.5369 20.4095 90.3526L15.4666 90.1813C3.6447 89.7716 -3.66059 77.1185 1.89556 66.6756L4.21867 62.3092C6.71845 57.6109 6.71845 51.977 4.21867 47.2786L1.89555 42.9123C-3.66059 32.4694 3.64471 19.8163 15.4666 19.4066L20.4095 19.2353C25.7283 19.051 30.6073 16.2341 33.4264 11.72L36.0462 7.52498Z"
        fill="url(#auth_union_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_union_gradient"
          x1="32.3672"
          y1="27.1939"
          x2="156.567"
          y2="158.294"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
