"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { resetPassword } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { AuthUnionIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthTitle } from "./AuthTypography";

type ResetPasswordFormProps = {
  token: string | null;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
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

    if (!token) {
      setError("Некорректная ссылка для сброса пароля");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      router.push("/login");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Не удалось обновить пароль",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <AuthUnionIcon className="auth-card__icon auth-card__icon--union" aria-hidden="true" />

      <AuthTitle>Сброс пароля</AuthTitle>

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <AuthFormFields subtitle="Введите новый пароль">
          <AuthInput
            label="Новый пароль"
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

        <AuthButton type="submit" disabled={isSubmitting}>
          Продолжить
        </AuthButton>
      </form>
    </AuthCard>
  );
}
