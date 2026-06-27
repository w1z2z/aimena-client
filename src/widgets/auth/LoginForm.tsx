"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/http";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthLink } from "./AuthLink";
import { AuthTitle } from "./AuthTypography";

export function LoginForm() {
  const router = useRouter();
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
      router.push(needsOnboarding ? "/onboarding" : "/");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Не удалось выполнить вход",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[67px]">
      <AuthTitle>Вход</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[24px]">
        <AuthFormFields subtitle="Введите почту, которая привязана к аккаунту">
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
          {error ? <p className="text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <div className="flex w-full flex-col items-center gap-[24px]">
          <AuthButton type="submit" disabled={isSubmitting}>
            Войти
          </AuthButton>

          <div className="flex w-full flex-wrap items-center justify-center gap-x-[26px] gap-y-[8px]">
            <AuthLink href="/forgot-password">Забыли свой пароль?</AuthLink>
            <AuthLink href="/register">Зарегистрироваться</AuthLink>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
