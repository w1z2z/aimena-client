import type { ReactNode } from "react";

import { AuthStarIcon, AuthUnionIcon } from "@/shared/ui/icons";

import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

type AuthMessageProps = {
  title: string;
  children: ReactNode;
  /** `union` — confirm / sent screens; `star` — login-style; `none` — no icon. */
  icon?: "star" | "union" | "none";
};

export function AuthMessage({ title, children, icon = "union" }: AuthMessageProps) {
  return (
    <AuthCard>
      {icon === "union" ? (
        <AuthUnionIcon className="auth-card__icon auth-card__icon--union" aria-hidden="true" />
      ) : null}
      {icon === "star" ? (
        <AuthStarIcon className="auth-card__icon auth-card__icon--star" aria-hidden="true" />
      ) : null}
      <AuthTitle>{title}</AuthTitle>
      <div className="flex w-full max-w-[494px] flex-col items-center gap-[24px] text-center font-[family-name:var(--font-manrope)] text-[14px] leading-[170%] text-[#1A1A1A]">
        {children}
      </div>
    </AuthCard>
  );
}

export function AuthFormFields({
  subtitle,
  children,
  className,
}: {
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full max-w-[508px] flex-col items-center gap-[24px] ${className ?? ""}`}
    >
      {subtitle ? <AuthSubtitle>{subtitle}</AuthSubtitle> : null}
      {children}
    </div>
  );
}
