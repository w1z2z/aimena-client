"use client";

import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ChangePasswordForm } from "@/widgets/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <AuthPageLayout>
      <ChangePasswordForm />
    </AuthPageLayout>
  );
}
