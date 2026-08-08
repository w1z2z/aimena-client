import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { ForgotPasswordSentPanel } from "@/widgets/auth/ForgotPasswordSentPanel";

type ForgotPasswordSentPageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function ForgotPasswordSentPage({
  searchParams,
}: ForgotPasswordSentPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const email = params?.email?.trim() || null;

  return (
    <AuthPageLayout>
      <ForgotPasswordSentPanel email={email} variant="forgot" />
    </AuthPageLayout>
  );
}
