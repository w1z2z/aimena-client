import type { IconProps } from "./types";

export const AUTH_PROMPT_ICON_SIZE = { width: 110, height: 81 } as const;

export function AuthPromptIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={AUTH_PROMPT_ICON_SIZE.width}
      height={AUTH_PROMPT_ICON_SIZE.height}
      viewBox="0 0 110 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M62.9552 70.0549C69.8988 84.2682 90.1552 84.2682 97.0988 70.0549L101.176 61.7101L106.364 54.008C115.202 40.888 105.073 23.3453 89.2921 24.4386L80.0275 25.0802L78.9914 25.009C83.0937 12.9274 73.9427 -0.459877 60.2902 0.0128555L39.9914 0.715981L19.6916 0.0128555C4.48391 -0.513672 -5.14198 16.1587 2.91812 29.0656L13.6769 46.2931L23.2169 64.2238C30.3646 77.6576 49.6171 77.6576 56.7648 64.2238L58.4445 61.0666L58.8791 61.7101L62.9552 70.0549Z"
        fill="url(#auth_prompt_gradient)"
      />
      <defs>
        <linearGradient
          id="auth_prompt_gradient"
          x1="59.1115"
          y1="79.0927"
          x2="165.266"
          y2="-12.4462"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
