import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return <section className={`auth-card${className ? ` ${className}` : ""}`}>{children}</section>;
}
