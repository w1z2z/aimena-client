import type { IconProps } from "./types";

export function LogoIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 71 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      {...props}
    >
      <mask id="logo_mask" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="71" height="54">
        <rect width="71" height="53.25" fill="url(#logo_pattern)" />
      </mask>
      <g mask="url(#logo_mask)">
        <rect x="-3.36621" width="85.3836" height="52.6379" fill="url(#logo_gradient)" />
      </g>
      <defs>
        <pattern id="logo_pattern" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#logo_image" transform="scale(0.00438597 0.00584795)" />
        </pattern>
        <linearGradient id="logo_gradient" x1="-3.36621" y1="8.70118" x2="82.0305" y2="43.9049" gradientUnits="userSpaceOnUse">
          <stop offset="0.243147" stopColor="#8E8BED" />
          <stop offset="0.485577" stopColor="#A987BD" />
          <stop offset="0.804549" stopColor="#C8FF00" />
        </linearGradient>
        <image
          id="logo_image"
          width="228"
          height="171"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}
