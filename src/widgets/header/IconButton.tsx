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
      className={`box-border flex h-[32px] w-[32px] items-center justify-center overflow-visible rounded-[13px] border-[0.3px] border-solid border-[#8E8BED] bg-[#FFFFFF] text-[#1A1A1A] transition-colors hover:bg-[#fafaff] ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
});
