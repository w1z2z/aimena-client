import Link from "next/link";
import type { ReactNode } from "react";

type AuthLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function AuthLink({ href, children, className }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={`font-[family-name:var(--font-golos)] text-[18px] leading-none tracking-[-0.18px] text-[#8E8BED] underline decoration-solid underline-offset-[2px] ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
