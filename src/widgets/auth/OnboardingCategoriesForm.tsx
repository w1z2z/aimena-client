"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ONBOARDING_CATEGORIES_STORAGE_KEY } from "@/features/auth";
import { getCategories } from "@/shared/api/catalog";

import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthSubtitle, AuthTitle } from "./AuthTypography";

export function OnboardingCategoriesForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void getCategories({ parentsOnly: true })
      .then((response) => {
        if (!isActive) return;
        setLoadError(null);
        setCategories(
          response.data.map((category) => ({
            id: category.id,
            label:
              category.shortName?.trim() ||
              category.name.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim(),
          })),
        );
      })
      .catch(() => {
        if (!isActive) return;
        setCategories([]);
        setLoadError("Не удалось загрузить категории. Обновите страницу и попробуйте снова.");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelected((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleNext = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ONBOARDING_CATEGORIES_STORAGE_KEY, JSON.stringify(selected));
    }
    router.push("/onboarding/city");
  };

  return (
    <AuthCard className="gap-[48px]">
      <AuthTitle className="max-w-[536px]">Выберите любимые категории</AuthTitle>

      <div className="flex w-full max-w-[508px] flex-col items-center gap-[24px]">
        <div className="flex w-full flex-col items-center gap-[24px]">
          <AuthSubtitle className="max-w-[454px]">
            Введите категории, которые вам нравятся, чтобы мы могли лучше вас понять!
          </AuthSubtitle>

          <div className="auth-category-grid">
            {categories.map((category) => {
              const isSelected = selected.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`auth-category-chip${isSelected ? " is-selected" : ""}`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="font-[family-name:var(--font-golos)] text-[18px] font-normal leading-none tracking-[-0.01em] text-[#1A1A1A]">
          Минимум 1 категория
        </p>
        {loadError ? <p className="text-[14px] text-[#FF2056]">{loadError}</p> : null}
      </div>

      <div className="flex w-full max-w-[508px]">
        <AuthButton
          type="button"
          disabled={selected.length === 0}
          onClick={handleNext}
        >
          Далее
        </AuthButton>
      </div>
    </AuthCard>
  );
}
