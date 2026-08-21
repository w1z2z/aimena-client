import { Suspense } from "react";

import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { LoginForm } from "@/widgets/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<p className="text-[14px] font-semibold text-[#626262]">Загрузка…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
