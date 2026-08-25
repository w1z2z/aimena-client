import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type AuthLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Inline legal links vs bottom nav links (forgot / register / has account). */
  variant?: "nav" | "inline";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function AuthLink({
  href,
  children,
  className,
  variant = "nav",
  onClick,
}: AuthLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`auth-link auth-link--${variant}${className ? ` ${className}` : ""}`}
    >
      {children}
    </Link>
  );
}
