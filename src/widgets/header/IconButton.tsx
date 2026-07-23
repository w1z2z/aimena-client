import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, label, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={`box-border flex h-[32px] w-[32px] items-center justify-center rounded-[13px] border border-[#8E8BED] border-[0.3px] bg-white text-[#1A1A1A] transition hover:bg-[#fafaff] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
});
