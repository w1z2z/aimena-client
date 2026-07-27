"use client";

import { useAuth } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ForgotPasswordForm } from "@/widgets/auth/ForgotPasswordForm";

export default function ChangePasswordPage() {
  const { user } = useAuth();

  return (
    <AuthPageLayout>
      <ForgotPasswordForm
        key={user?.email ?? "anon"}
        variant="change"
        initialEmail={user?.email ?? ""}
      />
    </AuthPageLayout>
  );
}
