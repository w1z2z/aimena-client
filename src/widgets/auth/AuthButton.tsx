import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

const variantClassName = {
  primary: "bg-[#8E8BED] text-white hover:brightness-[0.98]",
  secondary: "bg-[#9E9E9E] text-white hover:brightness-[0.98]",
};

export function AuthButton({
  children,
  variant = "primary",
  fullWidth = true,
  className,
  ...props
}: AuthButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-[62px] items-center justify-center rounded-[9.33px] px-[74px] py-[16px] font-[family-name:var(--font-manrope)] text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] transition active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""} ${variantClassName[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
