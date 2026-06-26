import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";

export default function ForgotPasswordSentPage() {
  return (
    <AuthPageLayout>
      <AuthMessage title="Письмо для сброса пароля отправлено">
        <p className="mb-0">Необходимо зайти в почту для сброса пароля.</p>
        <p>Отправили письмо с ссылкой на подтверждение на указанную почту</p>
      </AuthMessage>
    </AuthPageLayout>
  );
}
