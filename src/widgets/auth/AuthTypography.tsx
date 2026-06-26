import type { ReactNode } from "react";

type AuthTitleProps = {
  children: ReactNode;
  className?: string;
};

export function AuthTitle({ children, className }: AuthTitleProps) {
  return (
    <h1
      className={`text-center text-[40px] font-bold leading-[40px] tracking-[-0.2px] text-[#1A1A1A] ${className ?? ""}`}
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
    <p className={`text-center text-[14px] leading-[1.36] text-black/50 ${className ?? ""}`}>{children}</p>
  );
}
