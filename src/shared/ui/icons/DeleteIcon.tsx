import type { IconProps } from "./types";

export const DELETE_ICON_SIZE = { width: 14, height: 15 } as const;

export function DeleteIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={DELETE_ICON_SIZE.width}
      height={DELETE_ICON_SIZE.height}
      viewBox="0 0 14 15"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M11.4919 2.88086L11.0814 9.52248C10.9764 11.2193 10.924 12.0678 10.4987 12.6778C10.2884 12.9794 10.0177 13.2339 9.70365 13.4252C9.06857 13.8121 8.21852 13.8121 6.51835 13.8121C4.81601 13.8121 3.96481 13.8121 3.32931 13.4245C3.01512 13.2329 2.74429 12.9779 2.53407 12.6758C2.10888 12.0648 2.05758 11.2152 1.955 9.51592L1.55444 2.88086"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
      <path
        d="M8.18066 10.1684V6.19336"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
      <path
        d="M4.86743 10.1684V6.19336"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
      <path
        d="M0.5625 2.88125H12.4875M9.21189 2.88125L8.75967 1.94827C8.45922 1.32852 8.30897 1.01864 8.04987 0.825386C7.99243 0.782516 7.93154 0.744382 7.86788 0.711364C7.58095 0.5625 7.23658 0.5625 6.54785 0.5625C5.84182 0.5625 5.48884 0.5625 5.19713 0.717604C5.13249 0.751981 5.07079 0.791659 5.0127 0.836225C4.75058 1.03731 4.60416 1.35853 4.31132 2.00096L3.91006 2.88125"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
    </svg>
  );
}
