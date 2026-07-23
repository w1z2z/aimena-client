import type { IconProps } from "./types";

const GRADIENT_ANGLE_DEG = 142.68;
const gradientRadians = (GRADIENT_ANGLE_DEG * Math.PI) / 180;
const gradientSin = Math.sin(gradientRadians);
const gradientCos = Math.cos(gradientRadians);
const gradientX1 = `${50 - gradientSin * 50}%`;
const gradientY1 = `${50 + gradientCos * 50}%`;
const gradientX2 = `${50 + gradientSin * 50}%`;
const gradientY2 = `${50 - gradientCos * 50}%`;

/** viewBox padded so star tips are not clipped. */
export const FREE_PROMO_STAR_ICON_SIZE = { width: 535, height: 535 } as const;
const FREE_PROMO_STAR_VIEWBOX = "-8 -8 551 551";

export function FreePromoStarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={FREE_PROMO_STAR_ICON_SIZE.width}
      height={FREE_PROMO_STAR_ICON_SIZE.height}
      viewBox={FREE_PROMO_STAR_VIEWBOX}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path
        d="M224.579 24.9269C243.326 -8.31009 291.192 -8.31007 309.938 24.9269L375.227 140.682C379.617 148.465 386.051 154.9 393.834 159.289L509.59 224.578C542.827 243.325 542.827 291.191 509.59 309.937L393.834 375.226C386.051 379.616 379.617 386.05 375.227 393.833L309.938 509.589C291.192 542.826 243.326 542.826 224.579 509.589L159.29 393.833C154.901 386.05 148.466 379.616 140.683 375.226L24.9279 309.937C-8.30911 291.191 -8.3091 243.325 24.9279 224.578L140.683 159.289C148.466 154.9 154.901 148.465 159.29 140.682L224.579 24.9269Z"
        fill="url(#free-promo-star-gradient)"
      />
      <defs>
        <linearGradient
          id="free-promo-star-gradient"
          x1={gradientX1}
          y1={gradientY1}
          x2={gradientX2}
          y2={gradientY2}
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor="#8E8BED" offset="33.24%" />
          <stop stopColor="#C8FF00" offset="56.71%" />
        </linearGradient>
      </defs>
    </svg>
  );
}
