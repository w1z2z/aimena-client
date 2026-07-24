import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <section className="auth-card">
      <div className={`auth-card__inner${className ? ` ${className}` : ""}`}>{children}</div>
    </section>
  );
}
