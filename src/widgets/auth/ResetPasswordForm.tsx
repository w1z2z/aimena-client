"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthTitle } from "./AuthTypography";

export function ResetPasswordForm() {
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

    setIsSubmitting(true);
    try {
      router.push("/login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthTitle>Сброс пароля</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[48px]">
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
          {error ? <p className="text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting}>
          Продолжить
        </AuthButton>
      </form>
    </AuthCard>
  );
}
