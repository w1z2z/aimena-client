"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ONBOARDING_CATEGORIES_STORAGE_KEY, useAuth } from "@/features/auth";
import { getCities } from "@/shared/api/catalog";
import { ApiError } from "@/shared/api/http";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import { SelectField } from "@/shared/ui/select-field";
import { LogoIcon } from "@/shared/ui/icons";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

export function OnboardingCityForm() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategories = useMemo(() => {
    if (typeof window === "undefined") return [] as string[];

    try {
      const raw = window.sessionStorage.getItem(ONBOARDING_CATEGORIES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    void getCities({ page: 1, pageSize: 50 })
      .then((response) => {
        if (!isActive) return;
        setCityOptions(
          buildCitySelectOptions({
            featured: response.data.featured,
            cities: response.data.cities,
            mapCityToOption: (cityItem) => ({
              value: cityItem.id,
              label: cityItem.regionName
                ? `${cityItem.name}, ${cityItem.regionName}`
                : cityItem.name,
            }),
          }),
        );
      })
      .catch(() => {
        if (!isActive) return;
        setCityOptions([]);
      });

    return () => {
      isActive = false;
    };
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
      <LogoIcon className="w-[160px] h-auto" aria-hidden="true" />

      <AuthTitle>Укажите свой город</AuthTitle>

      <div className="flex w-full max-w-[508px] flex-col gap-[24px]">
        <AuthSubtitle className="max-w-[476px]">
          Укажите город, чтобы вам попадались объявления поближе к вам
        </AuthSubtitle>

        <SelectField
          value={city}
          onChange={setCity}
          options={cityOptions}
          placeholder="Выберите город"
          variant="field"
          allowCustomValue={false}
          aria-label="Выберите город"
        />
        {error ? <p className="text-[14px] text-[#FF2056]">{error}</p> : null}
      </div>

      <AuthButton type="button" disabled={!city || isSubmitting} onClick={() => finishOnboarding(city)}>
        Далее
      </AuthButton>
    </AuthCard>
  );
}
