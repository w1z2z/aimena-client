import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonPrimaryProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function ButtonPrimary({ children, className, ...props }: ButtonPrimaryProps) {
  return (
    <button
      className={`flex h-[32px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[36px] bg-[#C8FF00] px-[24px] py-[8px] text-[#1A1A1A] transition hover:brightness-[0.98] active:translate-y-[0.5px] ${className ?? ""}`}
      {...props}
    >
      <svg viewBox="0 0 10 10" fill="none" aria-hidden className="h-[10px] w-[10px] text-[#1A1A1A]">
        <path d="M5 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="whitespace-nowrap text-[14px] font-semibold leading-[1.2] tracking-[0.014px]">
        {children}
      </span>
    </button>
  );
}
