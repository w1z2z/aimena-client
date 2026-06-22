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
      className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-[#D9D9D9] transition hover:bg-[#d3d3d3] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
});
