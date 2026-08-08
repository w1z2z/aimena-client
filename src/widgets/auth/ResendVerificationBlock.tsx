"use client";

import { useCallback, useEffect, useState } from "react";

import { getAuthErrorMessage } from "@/features/auth";
import { resendVerification } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";

import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

const RESEND_COOLDOWN_SECONDS = 60;

type ResendVerificationBlockProps = {
  initialEmail?: string;
  /** Only set true when email is unknown (e.g. expired link in another browser). */
  showEmailField?: boolean;
  className?: string;
  /** Start locked (default true — letter was just sent). */
  startLocked?: boolean;
};

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ResendVerificationBlock({
  initialEmail = "",
  showEmailField = false,
  className,
  startLocked = true,
}: ResendVerificationBlockProps) {
  const [email, setEmail] = useState(initialEmail);
  const [cooldownLeft, setCooldownLeft] = useState(
    startLocked ? RESEND_COOLDOWN_SECONDS : 0,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

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
    const normalized = email.trim();
    if (!normalized) {
      setError("Не удалось определить email. Войдите и запросите письмо снова.");
      return;
    }
    if (cooldownLeft > 0 || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    // Block immediately — timer starts even if request is in flight.
    startCooldown();

    try {
      await resendVerification(normalized);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        startCooldown();
        setError("Подождите минуту перед повторной отправкой.");
      } else {
        setError(
          getAuthErrorMessage(requestError, "Не удалось отправить письмо. Попробуйте позже."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCoolingDown = cooldownLeft > 0;

  return (
    <div
      className={`flex w-full max-w-[508px] flex-col items-center gap-[16px] ${className ?? ""}`}
    >
      {showEmailField ? (
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      ) : null}

      {error ? <p className="text-center text-[14px] text-[#FF2056]">{error}</p> : null}

      <AuthButton
        type="button"
        onClick={handleResend}
        disabled={
          isCoolingDown || isSubmitting || (!showEmailField && !email.trim())
        }
      >
        {isCoolingDown
          ? `Отправить повторно (${formatCountdown(cooldownLeft)})`
          : isSubmitting
            ? "Отправляем..."
            : "Отправить повторно"}
      </AuthButton>
    </div>
  );
}
