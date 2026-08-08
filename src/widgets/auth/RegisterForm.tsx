"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getAuthErrorMessage, useAuth } from "@/features/auth";
import { rememberPendingVerifyEmail } from "@/shared/api/auth";
import { AUTH_STAR_ICON_SIZE, AuthStarIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthLink } from "./AuthLink";
import { AuthTitle } from "./AuthTypography";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email.trim(), password);
      rememberPendingVerifyEmail(email.trim());
      router.push("/register/confirm");
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError, "Не удалось завершить регистрацию"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <AuthStarIcon
        style={{
          width: AUTH_STAR_ICON_SIZE.width,
          height: AUTH_STAR_ICON_SIZE.height,
        }}
        aria-hidden="true"
      />

      <AuthTitle>Регистрация</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[48px]">
        <AuthFormFields subtitle="Введите данные для регистрации">
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
            autoComplete="new-password"
            showPasswordToggle
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <AuthInput
            label="Подтвердите пароль"
            type="password"
            autoComplete="new-password"
            showPasswordToggle
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          {error ? <p className="w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <div className="flex w-full flex-col items-center gap-[24px]">
          <AuthButton type="submit" disabled={isSubmitting}>
            Зарегистрироваться
          </AuthButton>

          <p className="max-w-[494px] text-center font-[family-name:var(--font-manrope)] text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
            Регистрируясь, вы соглашаетесь с{" "}
            <AuthLink href="/terms" variant="inline">
              Правилами пользования сервисом
            </AuthLink>{" "}
            и{" "}
            <AuthLink href="/privacy" variant="inline">
              Политикой конфиденциальности
            </AuthLink>{" "}
            и даёте согласие на получение рассылок.
          </p>
        </div>
      </form>

      <AuthLink href="/login">У меня есть аккаунт</AuthLink>
    </AuthCard>
  );
}
