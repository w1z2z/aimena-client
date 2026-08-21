"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ForgotPasswordSentPanel } from "@/widgets/auth/ForgotPasswordSentPanel";

export default function ChangePasswordSentPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/profile/settings")}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <AuthPageLayout>
        <p className="text-[14px] font-semibold text-[#626262]">Загрузка…</p>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <ForgotPasswordSentPanel email={user.email} variant="change" />
    </AuthPageLayout>
  );
}
