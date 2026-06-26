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
      router.push("/register/confirm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthTitle>Регистрация</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[24px]">
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
          {error ? <p className="text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <div className="flex w-full flex-col items-center gap-[12px]">
          <AuthButton type="submit" disabled={isSubmitting}>
            Зарегистрироваться
          </AuthButton>

          <p className="max-w-[494px] text-center text-[14px] leading-[1.36] text-[#1A1A1A]">
            Регистрируясь, вы соглашаетесь с{" "}
            <AuthLink href="/terms" className="text-[14px]">
              Правилами пользования сервисом и Политикой конфиденциальности
            </AuthLink>{" "}
            и даёте согласие на получение рассылок.
          </p>
        </div>
      </form>

      <AuthLink href="/login">У меня есть аккаунт</AuthLink>
    </AuthCard>
  );
}
