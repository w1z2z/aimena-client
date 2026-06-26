"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { onboardingCategories, type OnboardingCategory } from "@/features/auth";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

export function OnboardingCategoriesForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<OnboardingCategory[]>([]);

  const toggleCategory = (category: OnboardingCategory) => {
    setSelected((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const handleNext = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("swaply-onboarding-categories", JSON.stringify(selected));
    }
    router.push("/onboarding/city");
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("swaply-onboarding-categories");
    }
    router.push("/onboarding/city");
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthTitle className="max-w-[536px]">Выберите любимые категории</AuthTitle>

      <div className="flex w-full max-w-[508px] flex-col items-center gap-[24px]">
        <AuthSubtitle className="max-w-[454px]">
          Введите категории, которые вам нравятся, чтобы мы могли лучше вас понять!
        </AuthSubtitle>

        <div className="grid w-full grid-cols-2 gap-[12px]">
          {onboardingCategories.map((category) => {
            const isSelected = selected.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex h-[48px] items-center justify-center rounded-[10px] border px-[12px] py-[8px] text-[16px] font-bold leading-[20px] tracking-[0.016px] transition ${
                  isSelected
                    ? "border-[#8E8BED] bg-[#F3F2FF] text-[#8E8BED]"
                    : "border-[#3D3D3D] bg-white text-[#3D3D3D]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <p className="text-[18px] leading-none tracking-[-0.18px] text-[#1A1A1A]">Минимум 1 категория</p>
      </div>

      <div className="flex w-full gap-[24px]">
        <AuthButton type="button" variant="secondary" fullWidth={false} className="w-[193px] shrink-0" onClick={handleSkip}>
          Пропустить
        </AuthButton>
        <AuthButton type="button" className="flex-1" disabled={selected.length === 0} onClick={handleNext}>
          Далее
        </AuthButton>
      </div>
    </AuthCard>
  );
}
