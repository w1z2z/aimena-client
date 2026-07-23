import type { IconProps } from "./types";

const STAR_PATH =
  "M3.74738 0.341297C4.05464 -0.113782 4.72466 -0.113783 5.03192 0.341296L6.32082 2.25026C6.37636 2.33251 6.44718 2.40334 6.52944 2.45888L8.4384 3.74777C8.89348 4.05504 8.89348 4.72505 8.4384 5.03232L6.52944 6.32122C6.44718 6.37675 6.37636 6.44758 6.32082 6.52983L5.03192 8.43879C4.72466 8.89387 4.05464 8.89387 3.74738 8.43879L2.45848 6.52983C2.40294 6.44758 2.33212 6.37675 2.24986 6.32122L0.340901 5.03232C-0.114179 4.72505 -0.11418 4.05504 0.3409 3.74778L2.24986 2.45888C2.33212 2.40334 2.40294 2.33251 2.45848 2.25026L3.74738 0.341297Z";

/** Full path bbox (incl. bezier tips) so the star is not clipped and sits centered. */
export const TOGGLE_STAR_ICON_SIZE = { width: 10, height: 10 } as const;
const TOGGLE_STAR_VIEWBOX = "-0.12 -0.12 9.02 9.02";

export function ToggleStarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={TOGGLE_STAR_ICON_SIZE.width}
      height={TOGGLE_STAR_ICON_SIZE.height}
      viewBox={TOGGLE_STAR_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  );
}
