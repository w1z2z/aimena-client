import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ForgotPasswordSentPanel } from "@/widgets/auth/ForgotPasswordSentPanel";

type ChangePasswordSentPageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function ChangePasswordSentPage({
  searchParams,
}: ChangePasswordSentPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const email = params?.email?.trim() || null;

  return (
    <AuthPageLayout>
      <ForgotPasswordSentPanel email={email} variant="change" />
    </AuthPageLayout>
  );
}
