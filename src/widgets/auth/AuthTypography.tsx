import type { ReactNode } from "react";

type AuthTitleProps = {
  children: ReactNode;
  className?: string;
};

export function AuthTitle({ children, className }: AuthTitleProps) {
  return (
    <h1
      className={`flex items-center justify-center text-center font-[family-name:var(--font-manrope)] text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A] ${className ?? ""}`}
    >
      {children}
    </h1>
  );
}

type AuthSubtitleProps = {
  children: ReactNode;
  className?: string;
};

export function AuthSubtitle({ children, className }: AuthSubtitleProps) {
  return (
    <p
      className={`text-center font-[family-name:var(--font-manrope)] text-[14px] font-normal leading-[170%] text-black/50 ${className ?? ""}`}
    >
      {children}
    </p>
  );
}
