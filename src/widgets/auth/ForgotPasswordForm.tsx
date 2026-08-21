"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { forgotPassword } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { AuthUnionIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthTitle } from "./AuthTypography";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      router.push(`/forgot-password/sent?email=${encodeURIComponent(email.trim())}`);
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
      <AuthUnionIcon className="auth-card__icon auth-card__icon--union" aria-hidden="true" />

      <AuthTitle>Забыли пароль?</AuthTitle>

      <form onSubmit={(event) => void handleSubmit(event)} className="auth-form-stack">
        <AuthFormFields subtitle="Введите почту, чтобы сбросить пароль">
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
          {isSubmitting ? "Отправляем..." : "Сбросить пароль"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
