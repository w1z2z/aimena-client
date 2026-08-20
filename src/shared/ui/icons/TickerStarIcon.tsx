import type { IconProps } from "./types";

type TickerStarIconProps = IconProps & {
  gradientId?: string;
};

/** 22×22 star separator for the home ticker (Figma advantage). */
export function TickerStarIcon({
  className,
  gradientId = "ticker-star-grad",
  ...props
}: TickerStarIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block h-[22px] w-[22px] shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M9.01882 0.812469C9.75031 -0.270927 11.3454 -0.270926 12.0769 0.81247L15.1843 5.41476C15.3165 5.61059 15.4851 5.7792 15.6809 5.91142L20.2832 9.01882C21.3666 9.75031 21.3666 11.3454 20.2832 12.0769L15.6809 15.1843C15.4851 15.3165 15.3165 15.4851 15.1843 15.6809L12.0769 20.2832C11.3454 21.3666 9.75031 21.3666 9.01882 20.2832L5.91142 15.6809C5.7792 15.4851 5.61059 15.3165 5.41476 15.1843L0.812469 12.0769C-0.270927 11.3454 -0.270926 9.75031 0.81247 9.01882L5.41476 5.91142C5.61059 5.7792 5.7792 5.61059 5.91142 5.41476L9.01882 0.812469Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="-1.45215"
          y1="10.5479"
          x2="22.5479"
          y2="10.5479"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8BED" />
          <stop offset="1" stopColor="#c8ff02" />
        </linearGradient>
      </defs>
    </svg>
  );
}
