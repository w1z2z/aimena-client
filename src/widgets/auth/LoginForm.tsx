"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth";

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      const { needsOnboarding } = await login(email.trim(), password);
      router.push(needsOnboarding ? "/onboarding" : "/");
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
