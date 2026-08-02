"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  readPendingVerifyEmail,
  rememberPendingVerifyEmail,
  verifyEmail,
} from "@/shared/api/auth";

import { ResendVerificationBlock } from "./ResendVerificationBlock";

type VerifyEmailStatusProps = {
  token: string | null;
  email?: string | null;
};

export function VerifyEmailStatus({ token, email = null }: VerifyEmailStatusProps) {
  const router = useRouter();
  const verifyStartedRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "Подтверждаем вашу почту..." : "Ссылка подтверждения некорректна или устарела.",
  );
  const [resendEmail, setResendEmail] = useState(
    () => email?.trim() || readPendingVerifyEmail(),
  );

  useEffect(() => {
    const fromLink = email?.trim() ?? "";
    if (fromLink) {
      rememberPendingVerifyEmail(fromLink);
      setResendEmail(fromLink);
      return;
    }
    setResendEmail(readPendingVerifyEmail());
  }, [email]);

  useEffect(() => {
    if (!token || verifyStartedRef.current) {
      return;
    }
    verifyStartedRef.current = true;

    let isActive = true;
    void verifyEmail(token)
      .then((response) => {
        if (!isActive) return;
        setStatus("success");
        setMessage(response.message || "Почта успешно подтверждена.");
        window.setTimeout(() => {
          if (!isActive) return;
          router.replace("/login");
        }, 400);
      })
      .catch(() => {
        if (!isActive) return;
        setStatus("error");
        setMessage("Ссылка недействительна или устарела.");
      });

    return () => {
      isActive = false;
    };
  }, [router, token]);

  return (
    <>
      <p className="mb-0">{message}</p>
      <p className={status === "error" ? "mb-[8px]" : "mb-[24px]"}>
        {status === "loading"
          ? "Подождите немного, мы проверяем токен подтверждения."
          : status === "success"
            ? "Почта подтверждена. Перенаправляем на вход..."
            : "Если вы уже подтверждали почту по этой ссылке — просто войдите. Иначе запросите новое письмо ниже."}
      </p>
      {status === "error" ? (
        resendEmail ? (
          <ResendVerificationBlock initialEmail={resendEmail} />
        ) : (
          <p className="mb-0 text-[14px] text-[#1A1A1A]">
            Перейдите ко входу — если почта уже подтверждена, вход сработает. Если нет,
            запросите новое письмо там.
          </p>
        )
      ) : null}
    </>
  );
}
