import type { ReactNode } from "react";

import { AUTH_STAR_ICON_SIZE, AuthStarIcon } from "@/shared/ui/icons";

import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

type AuthMessageProps = {
  title: string;
  children: ReactNode;
  icon?: "star" | "logo" | "none";
};

export function AuthMessage({ title, children, icon = "star" }: AuthMessageProps) {
  return (
    <AuthCard className="gap-[48px]">
      {icon === "star" ? (
        <AuthStarIcon
          className="shrink-0"
          style={{
            width: AUTH_STAR_ICON_SIZE.width,
            height: AUTH_STAR_ICON_SIZE.height,
          }}
          aria-hidden="true"
        />
      ) : null}
      <AuthTitle>{title}</AuthTitle>
      <div className="flex w-full max-w-[494px] flex-col items-center gap-[24px] text-center text-[14px] leading-[1.36] text-[#1A1A1A]">
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
    <div className={`flex w-full max-w-[508px] flex-col gap-[24px] ${className ?? ""}`}>
      {subtitle ? <AuthSubtitle>{subtitle}</AuthSubtitle> : null}
      {children}
    </div>
  );
}
