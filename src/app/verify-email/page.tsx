import { AuthLink } from "@/widgets/auth/AuthLink";
import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { VerifyEmailStatus } from "@/widgets/auth/VerifyEmailStatus";

type VerifyEmailPageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token ?? null;

  return (
    <AuthPageLayout>
      <AuthMessage title="Подтвердите почту">
        <VerifyEmailStatus token={token} />
        <AuthLink href="/login">Перейти ко входу</AuthLink>
      </AuthMessage>
    </AuthPageLayout>
  );
}
