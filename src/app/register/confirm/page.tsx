"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  clearPendingVerifyEmail,
  getVerificationStatus,
  readPendingVerifyEmail,
} from "@/shared/api/auth";
import { AuthLink } from "@/widgets/auth/AuthLink";
import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ResendVerificationBlock } from "@/widgets/auth/ResendVerificationBlock";

const POLL_INTERVAL_MS = 3000;
const REDIRECT_DELAY_MS = 1200;

export default function RegisterConfirmPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setEmail(readPendingVerifyEmail());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!email || verified) return;

    let cancelled = false;
    let timerId = 0;

    const check = async () => {
      try {
        const status = await getVerificationStatus(email);
        if (cancelled) return;
        if (status.verified) {
          clearPendingVerifyEmail();
          setVerified(true);
          return;
        }
      } catch {
        // Keep waiting — transient network errors should not stop polling.
      }

      if (!cancelled) {
        timerId = window.setTimeout(check, POLL_INTERVAL_MS);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void check();
      }
    };

    void check();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [email, verified]);

  useEffect(() => {
    if (!verified) return;

    const timerId = window.setTimeout(() => {
      router.replace("/login");
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [verified, router]);

  return (
    <AuthPageLayout>
      <AuthMessage title={verified ? "Почта подтверждена" : "Подтвердите почту"}>
        {verified ? (
          <>
            <p className="mb-0">Отлично, email подтверждён.</p>
            <p>Перенаправляем на вход...</p>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col items-center gap-[8px]">
              <p className="mb-0">
                Необходимо подтвердить вашу почту для дальнейшей авторизации.
              </p>
              <p className="mb-0">
                Отправили письмо с ссылкой на подтверждение
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

            <div className="flex w-full flex-col items-center gap-[24px]">
              {ready ? <ResendVerificationBlock initialEmail={email} /> : null}
              <AuthLink href="/login">Перейти ко входу</AuthLink>
            </div>
          </>
        )}
      </AuthMessage>
    </AuthPageLayout>
  );
}
