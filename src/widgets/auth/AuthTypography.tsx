import type { ReactNode } from "react";

type AuthTitleProps = {
  children: ReactNode;
  className?: string;
};

export function AuthTitle({ children, className }: AuthTitleProps) {
  return <h1 className={`auth-title${className ? ` ${className}` : ""}`}>{children}</h1>;
}

type AuthSubtitleProps = {
  children: ReactNode;
  className?: string;
};

export function AuthSubtitle({ children, className }: AuthSubtitleProps) {
  return <p className={`auth-subtitle${className ? ` ${className}` : ""}`}>{children}</p>;
}
