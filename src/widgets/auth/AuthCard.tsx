import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <section
      className={`flex w-full flex-col items-center overflow-hidden rounded-[10px] bg-white p-[48px] ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
