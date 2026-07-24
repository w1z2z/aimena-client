import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";

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
      <AuthMessage title="Письмо для сброса пароля отправлено">
        <div className="flex w-full flex-col gap-[8px]">
          <p className="mb-0">Необходимо зайти в почту для сброса пароля.</p>
          <p className="mb-0">
            Отправили письмо со ссылкой для сброса пароля
            {email ? (
              <>
                {" "}
                на <span className="font-semibold text-[#1A1A1A]">{email}</span>
              </>
            ) : (
              " на указанную почту"
            )}
          </p>
        </div>
      </AuthMessage>
    </AuthPageLayout>
  );
}
