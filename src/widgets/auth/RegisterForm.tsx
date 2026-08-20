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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (!acceptTerms) {
      setError("Примите условия Пользовательского соглашения и Политики конфиденциальности");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, { marketingConsent });
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

          <div className="flex w-full max-w-[508px] flex-col gap-[12px]">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                required
              />
              <span>
                Принимаю условия{" "}
                <AuthLink
                  href="/terms"
                  variant="inline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Пользовательского соглашения
                </AuthLink>{" "}
                и{" "}
                <AuthLink
                  href="/privacy"
                  variant="inline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Политики конфиденциальности
                </AuthLink>
              </span>
            </label>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
              />
              <span>Согласен получать новости и предложения от сервиса</span>
            </label>
          </div>

          {error ? <p className="w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting || !acceptTerms}>
          Зарегистрироваться
        </AuthButton>
      </form>

      <AuthLink href="/login">У меня есть аккаунт</AuthLink>
    </AuthCard>
  );
}
