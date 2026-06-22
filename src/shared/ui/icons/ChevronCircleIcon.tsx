import type { IconProps } from "./types";

type ChevronCircleIconProps = IconProps & {
  direction?: "left" | "right";
};

export function ChevronCircleIcon({ className, direction = "right", ...props }: ChevronCircleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={direction === "left" ? `scale-y-[-1] rotate-180 ${className ?? ""}` : className}
      {...props}
    >
      <circle cx="17.7615" cy="17.7615" r="17.7615" fill="#CACACA" />
      <path
        d="M13.6211 9.5371C13.3477 9.79492 13.1941 10.1446 13.1941 10.5091C13.1941 10.8737 13.3477 11.2234 13.6211 11.4812L20.8395 18.2865L13.6211 25.0919C13.3638 25.3524 13.2238 25.6969 13.2304 26.0528C13.2371 26.4088 13.3899 26.7484 13.6567 27.0002C13.9236 27.2521 14.2837 27.3966 14.6612 27.4032C15.0387 27.4099 15.4042 27.2782 15.6809 27.036L23.9314 19.2596C24.2049 19.0018 24.3584 18.6522 24.3584 18.2876C24.3584 17.923 24.2049 17.5734 23.9314 17.3156L15.6832 9.5371C15.4097 9.27934 15.0388 9.13453 14.6521 9.13453C14.2654 9.13453 13.8946 9.27934 13.6211 9.5371Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}
