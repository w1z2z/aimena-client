"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getAuthErrorMessage, useAuth } from "@/features/auth";
import { rememberPendingVerifyEmail } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { AuthStarIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthLink } from "./AuthLink";
import { AuthTitle } from "./AuthTypography";

function resolveNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  // One-shot auth flows — never bounce back here after login.
  if (raw === "/change-password" || raw.startsWith("/change-password/")) return null;
  if (raw === "/forgot-password" || raw.startsWith("/forgot-password/")) return null;
  if (raw === "/reset-password" || raw.startsWith("/reset-password")) return null;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get("next"));
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const { needsOnboarding } = await login(email.trim(), password);
      if (needsOnboarding) {
        router.push("/onboarding");
        return;
      }
      router.push(nextPath ?? "/");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 403) {
        rememberPendingVerifyEmail(email.trim());
        router.replace("/register/confirm");
        return;
      }
      setError(getAuthErrorMessage(requestError, "Не удалось выполнить вход"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <AuthStarIcon className="auth-card__icon auth-card__icon--star" aria-hidden="true" />

      <AuthTitle>Вход</AuthTitle>

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <AuthFormFields subtitle="Введите данные аккаунта">
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <AuthInput
            label="Пароль"
            type="password"
            autoComplete="current-password"
            showPasswordToggle
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting}>
          Войти
        </AuthButton>

        <div className="flex w-full flex-wrap items-start justify-center gap-x-[26px] gap-y-[8px]">
          <AuthLink href="/forgot-password">Забыли свой пароль?</AuthLink>
          <AuthLink href="/register">Зарегистрироваться</AuthLink>
        </div>
      </form>
    </AuthCard>
  );
}
