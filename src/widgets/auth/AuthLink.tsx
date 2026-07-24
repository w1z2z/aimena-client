import Link from "next/link";
import type { ReactNode } from "react";

type AuthLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Inline legal links (14px Manrope) vs nav links (18px Golos Text). */
  variant?: "nav" | "inline";
};

export function AuthLink({
  href,
  children,
  className,
  variant = "nav",
}: AuthLinkProps) {
  const variantClassName =
    variant === "inline"
      ? "auth-link--inline font-[family-name:var(--font-manrope)] text-[14px] font-normal tracking-normal"
      : "auth-link--nav font-[family-name:var(--font-golos)] text-[18px] font-normal leading-none tracking-[-0.01em]";

  return (
    <Link href={href} className={`auth-link ${variantClassName} ${className ?? ""}`}>
      {children}
    </Link>
  );
}
