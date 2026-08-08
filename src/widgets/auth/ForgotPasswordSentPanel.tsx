"use client";

import { useCallback, useEffect, useState } from "react";

import { getAuthErrorMessage } from "@/features/auth";
import { forgotPassword } from "@/shared/api/auth";

import { AuthButton } from "./AuthButton";
import { AuthLink } from "./AuthLink";
import { AuthMessage } from "./AuthMessage";

const RESEND_COOLDOWN_SECONDS = 60;

type ForgotPasswordSentPanelProps = {
  email: string | null;
  variant?: "forgot" | "change";
};

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ForgotPasswordSentPanel({
  email,
  variant = "forgot",
}: ForgotPasswordSentPanelProps) {
  const [cooldownLeft, setCooldownLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownLeft(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;

    const timerId = window.setTimeout(() => {
      setCooldownLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [cooldownLeft]);

  const handleResend = async () => {
    const normalized = email?.trim() ?? "";
    if (!normalized || cooldownLeft > 0 || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    // Block immediately — timer starts even if request is in flight.
    startCooldown();

    try {
      await forgotPassword(normalized);
    } catch (requestError) {
      setError(
        getAuthErrorMessage(requestError, "Не удалось отправить письмо. Попробуйте позже."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCoolingDown = cooldownLeft > 0;
  const title =
    variant === "change"
      ? "Письмо для смены пароля отправлено"
      : "Письмо для сброса отправлено";
  const bodyLead =
    variant === "change"
      ? "Необходимо зайти в почту для смены пароля."
      : "Необходимо зайти в почту для сброса пароля.";
  const bodySent =
    variant === "change"
      ? "Отправили письмо со ссылкой для смены пароля"
      : "Отправили письмо со ссылкой для сброса пароля";

  return (
    <AuthMessage title={title}>
      <div className="flex w-full flex-col items-center gap-[8px]">
        <p className="mb-0">{bodyLead}</p>
        <p className="mb-0">
          {bodySent}
          {email ? (
            <>
              {" "}
              на <span className="font-semibold text-[#1A1A1A]">{email}</span>
            </>
          ) : (
            " на указанную почту"
          )}
        </p>
      </div>

      {error ? <p className="mb-0 w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}

      <div className="flex w-full flex-col items-center gap-[24px]">
        <AuthButton
          type="button"
          onClick={handleResend}
          disabled={!email?.trim() || isCoolingDown || isSubmitting}
        >
          {isCoolingDown
            ? `Отправить повторно (${formatCountdown(cooldownLeft)})`
            : isSubmitting
              ? "Отправляем..."
              : "Отправить повторно"}
        </AuthButton>

        <AuthLink href="/login">Перейти ко входу</AuthLink>
      </div>
    </AuthMessage>
  );
}
