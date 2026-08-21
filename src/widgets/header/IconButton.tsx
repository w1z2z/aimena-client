import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  /** Accent matches primary CTA (Разместить). */
  variant?: "default" | "accent";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, label, className, variant = "default", ...props },
  ref,
) {
  const toneClass =
    variant === "accent"
      ? "border-transparent bg-[#c8ff02] text-[#1A1A1A] hover:bg-[#A8E000] active:bg-[#96C800]"
      : "border-[#8E8BED] bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#f0e8ff]";

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={`relative box-border flex h-[32px] w-[32px] items-center justify-center overflow-visible rounded-[36px] border-[0.3px] border-solid transition-colors [-webkit-transform:translateZ(0)] [transform:translateZ(0)] ${toneClass} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
});
