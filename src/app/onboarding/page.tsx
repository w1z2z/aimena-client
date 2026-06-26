import { AuthPageLayout } from "@/widgets/auth/AuthPageLayout";
import { OnboardingCategoriesForm } from "@/widgets/auth/OnboardingCategoriesForm";

export default function OnboardingPage() {
  return (
    <AuthPageLayout>
      <OnboardingCategoriesForm />
    </AuthPageLayout>
  );
}
