"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { forgotPassword } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { AUTH_UNION_ICON_SIZE, AuthUnionIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthTitle } from "./AuthTypography";

export type ForgotPasswordVariant = "forgot" | "change";

type ForgotPasswordFormProps = {
  variant?: ForgotPasswordVariant;
  initialEmail?: string;
};

const COPY: Record<
  ForgotPasswordVariant,
  { title: string; subtitle: string; submit: string; sentPath: string }
> = {
  forgot: {
    title: "Забыли пароль?",
    subtitle: "Введите почту, которая привязана к аккаунту для сброса пароля",
    submit: "Сбросить пароль",
    sentPath: "/forgot-password/sent",
  },
  change: {
    title: "Сменить пароль",
    subtitle: "Введите почту, которая привязана к аккаунту для смены пароля",
    submit: "Сменить пароль",
    sentPath: "/change-password/sent",
  },
};

export function ForgotPasswordForm({
  variant = "forgot",
  initialEmail = "",
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const copy = COPY[variant];
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      router.push(`${copy.sentPath}?email=${encodeURIComponent(email.trim())}`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Не удалось отправить письмо для сброса пароля",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <AuthUnionIcon
        style={{
          width: AUTH_UNION_ICON_SIZE.width,
          height: AUTH_UNION_ICON_SIZE.height,
        }}
        aria-hidden="true"
      />

      <AuthTitle>{copy.title}</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[48px]">
        <AuthFormFields subtitle={copy.subtitle}>
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {error ? <p className="w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting}>
          {copy.submit}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
