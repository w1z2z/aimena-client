import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ResetPasswordForm } from "@/widgets/auth/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token ?? null;

  return (
    <AuthPageLayout>
      <ResetPasswordForm token={token} />
    </AuthPageLayout>
  );
}
