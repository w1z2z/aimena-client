"use client";

import { useCallback, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { useAuthGate } from "@/features/auth";
import { useHomeSearch } from "@/features/home-search";
import { writeHeroListingDraft } from "@/shared/lib/hero-listing-draft";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { COMPACT_HEADER_QUERY } from "@/widgets/header/constants";
import { Header } from "@/widgets/header/Header";

import { CategoriesArc } from "./CategoriesArc";
import { BASE_SCENE_HEIGHT, BASE_SCENE_WIDTH, HERO_CONTENT_SHIFT_UP } from "./constants";
import { HeroRecommendationsPanel } from "./HeroRecommendations";
import { ModeFormColumn } from "./HeroSearchForm";
import { TickerCarousel } from "./TickerCarousel";

const HERO_BACKGROUND =
  "linear-gradient(180deg, #141131 29.69%, #322F60 47.6%, #545193 67.22%, #8E8BED 100%)";

function HeroTitle() {
  return (
    <h1 className="home-hero-title">
      Обменивайтесь <span className="text-[#8E8BED]">без продаж</span>
    </h1>
  );
}

function HeroWhyAimena() {
  return (
    <p className="home-hero-why">
      Почему <span className="text-[#c8ff02]">Aimena</span>?
    </p>
  );
}

type FormProps = {
  mode: ReturnType<typeof useHomeSearch>["hero"]["mode"];
  setMode: ReturnType<typeof useHomeSearch>["setMode"];
  onAddListingClick: () => void;
  onViewAllClick: () => void;
  title: string;
  setTitle: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  cityOptions: ReturnType<typeof useHomeSearch>["cityOptions"];
  onCityInputChange: (value: string) => void;
  onCityListEndReached: () => void;
  condition: string;
  setCondition: (value: string) => void;
  midSlot?: ReactNode;
  compactLayout?: boolean;
};

function HeroForm(props: FormProps) {
  return (
    <ModeFormColumn
      mode={props.mode}
      setMode={props.setMode}
      onAddListingClick={props.onAddListingClick}
      onViewAllClick={props.onViewAllClick}
      title={props.title}
      setTitle={props.setTitle}
      price={props.price}
      setPrice={props.setPrice}
      city={props.city}
      setCity={props.setCity}
      cityOptions={props.cityOptions}
      onCityInputChange={props.onCityInputChange}
      onCityListEndReached={props.onCityListEndReached}
      condition={props.condition}
      setCondition={props.setCondition}
      midSlot={props.midSlot}
      compactLayout={props.compactLayout}
    />
  );
}

export function HomeTopBlock() {
  const router = useRouter();
  const { guardAuth } = useAuthGate();
  const isCompact = useMediaQuery(COMPACT_HEADER_QUERY);
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
  const recommendationsHeading = (
    <>
      Варианты <span className="text-[#8E8BED]">обмена</span>
    </>
  );

  const handleCreateListing = useCallback(() => {
    const cityLabel = cityOptions.find((item) => item.value === city && !item.disabled)?.label ?? "";
    writeHeroListingDraft({
      title,
      price,
      cityId: city,
      cityLabel,
    });
    guardAuth("create-listing", () => router.push("/create-listing"));
  }, [city, cityOptions, guardAuth, price, router, title]);

  const handleCategoryChange = useCallback(
    (nextCategoryId: string) => {
      setCategoryId(nextCategoryId);
      setCondition("");
      setMode("browse");
    },
    [setCategoryId, setCondition, setMode],
  );

  const formProps: FormProps = {
    mode,
    setMode,
    onAddListingClick: handleCreateListing,
    onViewAllClick: openFiltersAndScroll,
    title,
    setTitle,
    price,
    setPrice,
    city,
    setCity,
    cityOptions,
    onCityInputChange,
    onCityListEndReached,
    condition,
    setCondition,
  };

  const recommendations = (
    <HeroRecommendationsPanel
      heading={recommendationsHeading}
      loading={heroRecommendationsLoading}
      listings={heroRecommendations}
      isExchange={isExchange}
      isAllCategory={isAllCategory}
      layout={isCompact ? "compact" : "desktop"}
    />
  );

  const compactMidSlot = (
    <div className="home-hero-compact__results">
      <button
        type="button"
        className="home-hero-view-all-btn"
        onClick={openFiltersAndScroll}
      >
        Посмотрите все варианты
      </button>
      {recommendations}
    </div>
  );

  return (
    <div className="text-white" style={{ background: HERO_BACKGROUND }}>
      <Header />

      {isCompact ? (
        <div className="home-hero-compact">
          <div className="home-hero-compact__arc" aria-label="Категории">
            <div className="home-hero-compact__arc-stage">
              <CategoriesArc categories={categories} onCategoryChange={handleCategoryChange} />
            </div>
          </div>

          <div className="home-hero-compact__inner">
            <HeroTitle />
            <HeroForm {...formProps} compactLayout midSlot={compactMidSlot} />
            <HeroWhyAimena />
            <TickerCarousel compact />
          </div>
        </div>
      ) : (
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
                className="relative -translate-x-[240px]"
                style={{ height: `${BASE_SCENE_HEIGHT}px`, width: `${BASE_SCENE_WIDTH}px` }}
              >
                <div
                  className="absolute inset-0"
                  style={{ transform: `translateY(-${HERO_CONTENT_SHIFT_UP}px)` }}
                >
                  <CategoriesArc categories={categories} onCategoryChange={handleCategoryChange} />

                  <div className="home-hero-desktop-title">
                    <HeroTitle />
                  </div>

                  <div className="absolute left-[241px] top-[386px] z-10 flex h-[560px] w-[1440px] gap-[24px]">
                    <HeroForm {...formProps} />
                    {recommendations}
                  </div>

                  <div className="home-hero-desktop-why">
                    <HeroWhyAimena />
                  </div>

                  <TickerCarousel />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
