"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useAuthGate } from "@/features/auth";
import { useHomeSearch } from "@/features/home-search";
import { Header } from "@/widgets/header/Header";

import { CategoriesArc } from "./CategoriesArc";
import { BASE_SCENE_HEIGHT, BASE_SCENE_WIDTH, HERO_CONTENT_SHIFT_UP } from "./constants";
import { HeroRecommendationsPanel } from "./HeroRecommendations";
import { ModeFormColumn } from "./HeroSearchForm";
import { TickerCarousel } from "./TickerCarousel";

export function HomeTopBlock() {
  const router = useRouter();
  const { guardAuth } = useAuthGate();
  const {
    hero,
    setMode,
    setCategoryId,
    setTitle,
    setPrice,
    setCity,
    setCondition,
    heroRecommendations,
    heroRecommendationsLoading,
    openFiltersAndScroll,
    cityOptions,
    onCityInputChange,
    onCityListEndReached,
    categories,
  } = useHomeSearch();

  const { mode, title, price, city, condition, categoryId } = hero;
  const isExchange = mode === "exchange";
  const isAllCategory = categoryId === "all";
  const recommendationsHeading = "Варианты обмена";

  const handleCreateListing = useCallback(() => {
    guardAuth("create-listing", () => router.push("/create-listing"));
  }, [guardAuth, router]);

  const handleCategoryChange = useCallback(
    (nextCategoryId: string) => {
      setCategoryId(nextCategoryId);
      setCondition("");
      setMode("browse");
    },
    [setCategoryId, setCondition, setMode],
  );

  return (
    <div className="bg-[#1A1A1A] text-white">
      <Header />

      <div className="relative w-full overflow-hidden" style={{ height: `${BASE_SCENE_HEIGHT}px` }}>
        <div
          className="relative left-1/2 origin-top"
          style={{
            height: `${BASE_SCENE_HEIGHT}px`,
            width: `${BASE_SCENE_WIDTH}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute left-[240px] top-0 z-20 w-[1440px]">
            <div className="h-[54px]" aria-hidden="true" />

            <section
              className="relative -translate-x-[240px] bg-[#1A1A1A]"
              style={{ height: `${BASE_SCENE_HEIGHT}px`, width: `${BASE_SCENE_WIDTH}px` }}
            >
              <div
                className="absolute inset-0"
                style={{ transform: `translateY(-${HERO_CONTENT_SHIFT_UP}px)` }}
              >
                <CategoriesArc categories={categories} onCategoryChange={handleCategoryChange} />

                <h1 className="absolute left-[685px] top-[289px] w-max whitespace-nowrap text-[40px] font-bold leading-[40px] tracking-[-0.005em]">
                  Обменивайтесь <span className="text-[#8E8BED]">без продаж</span>
                </h1>

                <div
                  className="absolute left-[241px] top-[386px] z-10 flex h-[535px] w-[1440px] gap-[24px]"
                >
                  <ModeFormColumn
                    mode={mode}
                    setMode={setMode}
                    onAddListingClick={handleCreateListing}
                    onViewAllClick={openFiltersAndScroll}
                    title={title}
                    setTitle={setTitle}
                    price={price}
                    setPrice={setPrice}
                    city={city}
                    setCity={setCity}
                    cityOptions={cityOptions}
                    onCityInputChange={onCityInputChange}
                    onCityListEndReached={onCityListEndReached}
                    condition={condition}
                    setCondition={setCondition}
                  />

                  <HeroRecommendationsPanel
                    heading={recommendationsHeading}
                    loading={heroRecommendationsLoading}
                    listings={heroRecommendations}
                    isExchange={isExchange}
                    isAllCategory={isAllCategory}
                  />
                </div>

                <p
                  className="pointer-events-none absolute left-1/2 z-20 w-max -translate-x-1/2 text-center text-[24px] font-extrabold leading-[32px] tracking-[-0.072px] text-white"
                  style={{ top: "981px" }}
                >
                  Почему <span className="text-[#8E8BED]">Aimena</span>?
                </p>

                <TickerCarousel />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
