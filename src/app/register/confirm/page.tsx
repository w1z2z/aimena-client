import { AuthMessage } from "@/widgets/auth/AuthMessage";
import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";

export default function RegisterConfirmPage() {
  return (
    <AuthPageLayout>
      <AuthMessage title="Подтвердите почту">
        <p className="mb-0">Необходимо подтвердить вашу почту для дальнейшей авторизации.</p>
        <p>Отправили письмо с ссылкой на подтверждение на указанную почту</p>
      </AuthMessage>
    </AuthPageLayout>
  );
}
