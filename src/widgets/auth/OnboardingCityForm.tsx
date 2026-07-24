"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ONBOARDING_CATEGORIES_STORAGE_KEY, useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/http";
import { useCitySelectOptions } from "@/shared/lib/use-city-select-options";
import { AuthUnionIcon } from "@/shared/ui/icons";
import { SelectField, type SelectOption } from "@/shared/ui/select-field";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

export function OnboardingCityForm() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [city, setCity] = useState("");
  const [pinnedCity, setPinnedCity] = useState<SelectOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cityOptions, onCityInputChange, onCityListEndReached } = useCitySelectOptions({
    selectedCityId: city,
    pinnedOption: pinnedCity,
  });

  const selectedCategories = useMemo(() => {
    if (typeof window === "undefined") return [] as string[];

    try {
      const raw = window.sessionStorage.getItem(ONBOARDING_CATEGORIES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const finishOnboarding = async (selectedCityId: string | null) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedCategories, selectedCityId);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ONBOARDING_CATEGORIES_STORAGE_KEY);
      }

      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Не удалось завершить онбординг. Проверьте введенные данные.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthUnionIcon aria-hidden="true" />

      <AuthTitle className="max-w-[396px]">Укажите свой город</AuthTitle>

      <div className="flex w-full max-w-[508px] flex-col items-center gap-[24px]">
        <AuthSubtitle className="max-w-[476px]">
          Укажите город, чтобы вам попадались объявления поближе к вам
        </AuthSubtitle>

        <SelectField
          value={city}
          onChange={(next) => {
            setCity(next);
            if (!next) {
              setPinnedCity(null);
              return;
            }
            const option = cityOptions.find((item) => item.value === next && !item.disabled);
            if (option) setPinnedCity(option);
          }}
          onInputChange={onCityInputChange}
          onListEndReached={onCityListEndReached}
          options={cityOptions}
          placeholder="Выберите город"
          variant="field"
          searchable
          allowCustomValue={false}
          className="auth-city-select"
          aria-label="Выберите город"
        />
        {error ? <p className="text-[14px] text-[#FF2056]">{error}</p> : null}
      </div>

      <div className="w-full max-w-[508px]">
        <AuthButton
          type="button"
          disabled={!city || isSubmitting}
          onClick={() => finishOnboarding(city)}
        >
          Далее
        </AuthButton>
      </div>
    </AuthCard>
  );
}
