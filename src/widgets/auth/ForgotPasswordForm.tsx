"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthInput } from "./AuthInput";
import { AuthTitle } from "./AuthTypography";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      router.push(`/forgot-password/sent?email=${encodeURIComponent(email.trim())}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthTitle>Забыли пароль?</AuthTitle>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[48px]">
        <AuthFormFields subtitle="Введите почту, которая привязана к аккаунту для сброса пароля">
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting}>
          Сбросить пароль
        </AuthButton>
      </form>
    </AuthCard>
  );
}
