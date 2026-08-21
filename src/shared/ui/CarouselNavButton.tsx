import type { ButtonHTMLAttributes } from "react";

type CarouselNavButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "aria-label"
> & {
  direction: "left" | "right";
  label: string;
};

/** Gallery / carousel prev-next control — Figma listing photo nav (49×65, thick chevron). */
export function CarouselNavButton({
  direction,
  label,
  className,
  ...props
}: CarouselNavButtonProps) {
  const isPrev = direction === "left";

  return (
    <button
      type="button"
      aria-label={label}
      className={[
        "carousel-nav-btn",
        isPrev ? "carousel-nav-btn--prev" : "carousel-nav-btn--next",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <svg
        className="carousel-nav-btn__icon"
        width="16"
        height="25"
        viewBox="0 0 16 25"
        fill="none"
        aria-hidden
      >
        <path
          d="M2.875 22.5L13.125 12.25L2.875 2"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
