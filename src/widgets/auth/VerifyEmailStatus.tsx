"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { verifyEmail } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";

type VerifyEmailStatusProps = {
  token: string | null;
};

export function VerifyEmailStatus({ token }: VerifyEmailStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "Подтверждаем вашу почту..." : "Ссылка подтверждения некорректна или устарела.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

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
      .catch((requestError) => {
        if (!isActive) return;
        setStatus("error");
        setMessage(
          requestError instanceof ApiError
            ? requestError.message
            : "Не удалось подтвердить почту. Попробуйте снова.",
        );
      });

    return () => {
      isActive = false;
    };
  }, [router, token]);

  return (
    <>
      <p className="mb-0">{message}</p>
      <p className="mb-[24px]">
        {status === "loading"
          ? "Подождите немного, мы проверяем токен подтверждения."
          : status === "success"
            ? "Почта подтверждена. Перенаправляем на вход..."
            : "Проверьте ссылку в письме или запросите новую."}
      </p>
    </>
  );
}
