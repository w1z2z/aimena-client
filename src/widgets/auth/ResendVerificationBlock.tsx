"use client";

import { useEffect, useState } from "react";

import { getAuthErrorMessage } from "@/features/auth";
import { resendVerification } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";

import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

type ResendVerificationBlockProps = {
  initialEmail?: string;
  /** Only set true when email is unknown (e.g. expired link in another browser). */
  showEmailField?: boolean;
  className?: string;
};

export function ResendVerificationBlock({
  initialEmail = "",
  showEmailField = false,
  className,
}: ResendVerificationBlockProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleResend = async () => {
    const normalized = email.trim();
    if (!normalized) {
      setError("Не удалось определить email. Войдите и запросите письмо снова.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await resendVerification(normalized);
      setSuccess(
        "Если аккаунт ещё не подтверждён — отправили новое письмо. Проверьте почту.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        setError("Подождите около минуты перед повторной отправкой.");
      } else {
        setError(getAuthErrorMessage(requestError, "Не удалось отправить письмо. Попробуйте позже."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {success ? <p className="text-center text-[14px] text-[#1A1A1A]">{success}</p> : null}

      <AuthButton
        type="button"
        onClick={handleResend}
        disabled={isSubmitting || (!showEmailField && !email.trim())}
        className="text-[18px]"
      >
        {isSubmitting ? "Отправляем..." : "Отправить письмо ещё раз"}
      </AuthButton>
    </div>
  );
}
