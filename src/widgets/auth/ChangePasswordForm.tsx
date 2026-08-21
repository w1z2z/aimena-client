"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth";
import { forgotPassword } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { AUTH_UNION_ICON_SIZE, AuthUnionIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthFormFields } from "./AuthMessage";
import { AuthTitle } from "./AuthTypography";

export function ChangePasswordForm() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/profile/settings")}`);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = user?.email?.trim();
    if (!email || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      router.push("/change-password/sent");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Не удалось отправить письмо для смены пароля",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <AuthCard>
        <p className="text-[14px] font-semibold text-[#626262]">Загрузка…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthUnionIcon
        style={{
          width: AUTH_UNION_ICON_SIZE.width,
          height: AUTH_UNION_ICON_SIZE.height,
        }}
        aria-hidden="true"
      />

      <AuthTitle>Сменить пароль</AuthTitle>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex w-full flex-col items-center gap-[48px]">
        <AuthFormFields subtitle="Отправим ссылку для смены пароля на вашу почту">
          <p className="w-full break-all text-center text-[16px] font-semibold leading-[1.4] text-[#8E8BED]">
            {user.email}
          </p>
          {error ? <p className="w-full text-center text-[14px] text-[#FF2056]">{error}</p> : null}
        </AuthFormFields>

        <AuthButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Отправляем..." : "Отправить ссылку"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
