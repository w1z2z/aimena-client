import type { IconProps } from "./types";

export function BellIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 13.8125 15.4372" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M9.35905 11.7811H4.45163M9.35905 11.7811H12.2954C13.8196 11.7811 13.562 10.2698 12.791 9.50285C10.0139 6.74445 13.9585 0.406243 6.90534 0.406243C-0.147859 0.406243 3.79758 6.74364 1.0205 9.50285C0.278697 10.2406 -0.0373599 11.7811 1.51611 11.7811H4.45163M9.35905 11.7811C9.35905 13.3451 8.83256 15.031 6.90534 15.031C4.97812 15.031 4.45163 13.3451 4.45163 11.7811"
        stroke="currentColor"
        strokeWidth="0.812487"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
