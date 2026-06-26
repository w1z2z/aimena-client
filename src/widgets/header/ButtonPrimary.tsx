import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonPrimaryProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function ButtonPrimary({ children, className, ...props }: ButtonPrimaryProps) {
  return (
    <button
      className={`flex h-[32px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[10px] border border-[#95B815] border-[0.5px] bg-[#C8FF00] px-[24px] py-[8px] text-[#1A1A1A] transition hover:brightness-[0.98] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      <span style={{ fontFamily: "var(--font-golos)" }} className="text-[24px] leading-none">
        +
      </span>
      <span className="whitespace-nowrap text-[14px] font-semibold leading-[1.2] tracking-[0.014px]">
        {children}
      </span>
    </button>
  );
}
