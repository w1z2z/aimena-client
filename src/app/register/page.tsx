import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { RegisterForm } from "@/widgets/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
