"use client";

import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuthGate } from "@/features/auth";
import { useHomeSearch } from "@/features/home-search";
import { Header } from "@/widgets/header/Header";

import { CategoriesArc } from "./CategoriesArc";
import { CenterExchangeBadge } from "./CenterExchangeBadge";
import { BASE_SCENE_HEIGHT, BASE_SCENE_WIDTH, HERO_CONTENT_SHIFT_UP } from "./constants";
import { HeroRecommendationsPanel } from "./HeroRecommendations";
import { ModeFormColumn, renderTabIcon } from "./HeroSearchForm";
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
    setHasDocuments,
    setCondition,
    heroRecommendations,
    heroRecommendationsLoading,
    openFiltersAndScroll,
    cityOptions,
    categories,
  } = useHomeSearch();
  const [sceneScale, setSceneScale] = useState(1);

  const { mode, title, price, city, hasDocuments, condition, categoryId } = hero;
  const isExchange = mode === "exchange";
  const isAllCategory = categoryId === "all";
  const recommendationsHeading = isAllCategory
    ? "Случайные объявления из каталога"
    : isExchange
      ? "Что готовы обменять на вашу вещь"
      : "Варианты обмена по вашему запросу";

  const blurButtonAfterClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

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

  const topTabs = useMemo(
    () => [
      { id: "exchange" as const, label: "Хочу обменять" },
      { id: "browse" as const, label: "Хочу посмотреть" },
    ],
    [],
  );

  useEffect(() => {
    const applyScale = () => {
      const nextScale = Math.min(1, window.innerWidth / BASE_SCENE_WIDTH);
      setSceneScale(nextScale);
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    return () => {
      window.removeEventListener("resize", applyScale);
    };
  }, []);

  return (
    <div className="bg-[#1A1A1A] text-white">
      <Header />

      <div className="relative w-full overflow-hidden" style={{ height: `${BASE_SCENE_HEIGHT * sceneScale}px` }}>
        <div
          className="relative left-1/2 h-[1330px] w-[1920px] origin-top"
          style={{ transform: `translateX(-50%) scale(${sceneScale})` }}
        >
          <div className="absolute left-[239px] top-0 z-20 w-[1441px]">
            <div className="h-[54px]" aria-hidden="true" />

            <section
              className="relative w-[2011px] -translate-x-[285px]"
              style={{ height: `${1280 - HERO_CONTENT_SHIFT_UP}px` }}
            >
              <CategoriesArc categories={categories} onCategoryChange={handleCategoryChange} />

              <h1
                className="absolute left-[492px] w-[579px] text-[40px] font-bold leading-[40px]"
                style={{ top: `${350 - HERO_CONTENT_SHIFT_UP}px` }}
              >
                Обменивайтесь <span className="text-[#8E8BED]">без продаж</span> и лишних переговоров
              </h1>

              <div
                className="absolute left-[1065px] flex w-[453px] gap-[12px]"
                style={{ top: `${354 - HERO_CONTENT_SHIFT_UP}px` }}
              >
                {topTabs.map((tab) => {
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={(event) => {
                        setMode(tab.id);
                        blurButtonAfterClick(event);
                      }}
                      className={`flex h-[76px] flex-1 flex-col items-center justify-center gap-[4px] rounded-[10px] border border-[0.5px] px-[24px] py-[12px] text-[14px] font-semibold outline-none transition focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none ${
                        active
                          ? "border-[#F8F8F5] bg-[#8E8BED] text-white"
                          : "border-white bg-[#1A1A1A] text-white hover:bg-[#252525]"
                      }`}
                    >
                      <span className="flex h-[17px] items-center justify-center">{renderTabIcon(tab.id, active)}</span>
                      <span className="leading-[1.2]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className="absolute left-[492px] z-10 flex h-[535px] w-[1026px] gap-[12px]"
                style={{ top: `${486 - HERO_CONTENT_SHIFT_UP}px` }}
              >
                <ModeFormColumn
                  isExchange={isExchange}
                  onAddListingClick={handleCreateListing}
                  title={title}
                  setTitle={setTitle}
                  price={price}
                  setPrice={setPrice}
                  city={city}
                  setCity={setCity}
                  cityOptions={cityOptions}
                  hasDocuments={hasDocuments}
                  setHasDocuments={setHasDocuments}
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

                <CenterExchangeBadge onClick={openFiltersAndScroll} />
              </div>

              <p
                className="pointer-events-none absolute left-1/2 z-20 w-max -translate-x-1/2 text-center text-[24px] font-extrabold leading-[32px] tracking-[-0.072px] text-white"
                style={{ top: `${1084 - HERO_CONTENT_SHIFT_UP}px` }}
              >
                Почему <span className="text-[#8E8BED]">Aimena</span>?
              </p>

              <TickerCarousel />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
