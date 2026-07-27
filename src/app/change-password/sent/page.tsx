import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";

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
      <AuthMessage title="Письмо для смены пароля отправлено">
        <div className="flex w-full flex-col gap-[8px]">
          <p className="mb-0">Необходимо зайти в почту для смены пароля.</p>
          <p className="mb-0">
            Отправили письмо со ссылкой для смены пароля
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
