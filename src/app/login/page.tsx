import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { LoginForm } from "@/widgets/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
