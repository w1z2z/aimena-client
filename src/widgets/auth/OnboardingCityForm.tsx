"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { cityOptions, useAuth } from "@/features/auth";
import { ComboboxField } from "@/shared/ui/combobox-field/ComboboxField";
import { LogoIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

const cityComboboxOptions = cityOptions.map((city) => ({ value: city, label: city }));

export function OnboardingCityForm() {
  const router = useRouter();
  const { completeOnboarding, markOnboardingSkipped } = useAuth();
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategories = useMemo(() => {
    if (typeof window === "undefined") return [] as string[];

    try {
      const raw = window.sessionStorage.getItem("swaply-onboarding-categories");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const finishOnboarding = async (selectedCity: string | null) => {
    setIsSubmitting(true);
    try {
      if (selectedCategories.length > 0 || selectedCity) {
        completeOnboarding(selectedCategories, selectedCity);
      } else {
        markOnboardingSkipped();
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("swaply-onboarding-categories");
      }

      router.push("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[48px]">
      <LogoIcon className="h-[110px] w-[160px]" aria-hidden="true" />

      <AuthTitle>Укажите свой город</AuthTitle>

      <div className="flex w-full max-w-[508px] flex-col gap-[24px]">
        <AuthSubtitle className="max-w-[476px]">
          Укажите город, чтобы вам попадались объявления поближе к вам
        </AuthSubtitle>

        <ComboboxField
          value={city}
          onChange={setCity}
          options={cityComboboxOptions}
          placeholder="Выберите город"
          aria-label="Выберите город"
          wrapClassName="auth-city-combobox"
          inputClassName="auth-city-combobox__input"
          listClassName="auth-city-combobox__list"
          optionClassName="auth-city-combobox__option"
          chevronClassName="auth-city-combobox__chevron"
        />
      </div>

      <AuthButton type="button" disabled={!city || isSubmitting} onClick={() => finishOnboarding(city)}>
        Далее
      </AuthButton>
    </AuthCard>
  );
}
