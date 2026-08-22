"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { ListingCard, ListingCardSkeleton, type ListingCardData } from "@/entities/listing";
import { CarouselNavButton } from "@/shared/ui/CarouselNavButton";

function HeroRecommendationsEmpty({
  isExchange,
  isAllCategory,
}: {
  isExchange: boolean;
  isAllCategory: boolean;
}) {
  return (
    <div
      className="home-hero-recs__empty box-border flex h-[464px] w-[342px] flex-col items-center justify-center rounded-[31px] border-[3px] border-solid border-transparent px-[24px] py-[32px] text-center"
      style={{
        background:
          "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%) border-box",
      }}
    >
      <p className="text-[18px] font-semibold text-[#1A1A1A]">Нет подходящих вариантов</p>
      <p className="mt-[8px] text-[14px] leading-[1.35] text-[#626262]">
        {isAllCategory
          ? "Сейчас активных объявлений нет — загляните позже или откройте полный список."
          : isExchange
            ? "Попробуйте другое название, город или категорию."
            : "Измените фильтры или выберите другую категорию."}
      </p>
    </div>
  );
}

function HeroRecommendationsLoading() {
  return <ListingCardSkeleton />;
}

type HeroRecommendationsPanelProps = {
  heading: ReactNode;
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
  /** Compact: horizontal rail under/beside the form, no nested page-scroll trap */
  layout?: "desktop" | "compact";
};

type DisplayedRecommendations = {
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
};

export function HeroRecommendationsPanel({
  heading,
  loading,
  listings,
  isExchange,
  isAllCategory,
  layout = "desktop",
}: HeroRecommendationsPanelProps) {
  const isCompact = layout === "compact";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [displayed, setDisplayed] = useState<DisplayedRecommendations>({
    loading,
    listings,
    isExchange,
    isAllCategory,
  });
  const isFirstModeRender = useRef(true);
  const latestPropsRef = useRef({ loading, listings, isExchange, isAllCategory });
  latestPropsRef.current = { loading, listings, isExchange, isAllCategory };

  useLayoutEffect(() => {
    if (isFirstModeRender.current) {
      isFirstModeRender.current = false;
      return;
    }

    setVisible(false);
    const swapTimer = window.setTimeout(() => {
      setDisplayed(latestPropsRef.current);
      window.requestAnimationFrame(() => setVisible(true));
    }, 280);

    return () => window.clearTimeout(swapTimer);
  }, [isExchange]);

  useLayoutEffect(() => {
    if (!visible || displayed.isExchange !== isExchange) return;
    setDisplayed({ loading, listings, isExchange, isAllCategory });
  }, [visible, loading, listings, isExchange, isAllCategory, displayed.isExchange]);

  const scrollKey = displayed.loading
    ? "loading"
    : displayed.listings.length > 0
      ? displayed.listings.map((item) => item.id).join("-")
      : "empty";

  const [scrollSettling, setScrollSettling] = useState(true);

  const syncCompactNav = useCallback(() => {
    const node = scrollRef.current;
    if (!node || !isCompact) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 4) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(maxScroll - node.scrollLeft > 4);
  }, [isCompact]);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !visible) return;

    setScrollSettling(true);
    if (isCompact) {
      node.scrollLeft = 0;
    } else {
      node.scrollTop = 0;
    }

    const settleTimer = window.setTimeout(() => {
      if (isCompact) {
        node.scrollLeft = 0;
      } else {
        node.scrollTop = 0;
      }
      setScrollSettling(false);
      syncCompactNav();
    }, 80);

    return () => window.clearTimeout(settleTimer);
  }, [scrollKey, visible, isCompact, syncCompactNav]);

  useEffect(() => {
    if (!isCompact) return;
    const node = scrollRef.current;
    if (!node) return;

    syncCompactNav();
    node.addEventListener("scroll", syncCompactNav, { passive: true });
    window.addEventListener("resize", syncCompactNav);

    const frameId = window.requestAnimationFrame(syncCompactNav);
    return () => {
      node.removeEventListener("scroll", syncCompactNav);
      window.removeEventListener("resize", syncCompactNav);
      window.cancelAnimationFrame(frameId);
    };
  }, [isCompact, scrollKey, visible, syncCompactNav]);

  const scrollCompactByStep = (direction: 1 | -1) => {
    const node = scrollRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>("[data-recommendation-card]");
    const gap = 12;
    const step = (firstCard?.offsetWidth ?? node.clientWidth) + gap;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const showCompactNav = isCompact && !displayed.loading && displayed.listings.length > 1;
  const rail = (
    <div
      key={scrollKey}
      ref={scrollRef}
      className={
        isCompact
          ? `home-hero-recs__rail${scrollSettling ? " is-scroll-settling" : ""}`
          : `home-recommendations-scroll min-h-0 w-[366px] flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-[12px] [overflow-anchor:none]${
              scrollSettling ? " is-scroll-settling" : ""
            }`
      }
    >
      <div
        className={`hero-recommendations-fade ${
          isCompact ? "home-hero-recs__rail-track" : "flex flex-col items-center gap-[16px]"
        } ${visible ? "is-visible" : "is-hidden"}`}
      >
        {displayed.loading ? (
          <div data-recommendation-card className="home-hero-recs__card">
            <HeroRecommendationsLoading />
          </div>
        ) : displayed.listings.length > 0 ? (
          displayed.listings.map((listing) => (
            <div
              key={listing.id}
              data-recommendation-card
              className={
                isCompact
                  ? "home-hero-recs__card"
                  : "flex h-[464px] w-[342px] shrink-0 justify-center"
              }
            >
              <ListingCard
                listingId={listing.id}
                variant="hero"
                title={listing.title}
                city={listing.city}
                condition={listing.condition}
                coverImageUrl={listing.coverImageUrl}
                wants={listing.wants}
                wantCategories={listing.wantCategories}
                isFree={listing.isFree}
                isFavorite={listing.isFavorite}
                ownerId={listing.ownerId}
              />
            </div>
          ))
        ) : (
          <div data-recommendation-card className="home-hero-recs__card home-hero-recs__card--empty">
            <HeroRecommendationsEmpty
              isExchange={displayed.isExchange}
              isAllCategory={displayed.isAllCategory}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={
        isCompact
          ? "home-hero-recs home-hero-recs--compact"
          : "home-hero-recs relative flex h-[560px] w-[464px] flex-col items-center gap-[24px] overflow-hidden rounded-[31px] bg-white p-[24px]"
      }
    >
      <div
        className={
          isCompact
            ? "home-hero-recs__heading"
            : "flex h-[24px] w-[330px] shrink-0 items-center justify-center text-center text-[#1A1A1A]"
        }
      >
        <p
          className={
            isCompact
              ? "home-hero-recs__heading-text"
              : "text-[24px] font-extrabold leading-none tracking-[-0.003em]"
          }
        >
          {heading}
        </p>
      </div>

      {isCompact ? (
        <div className="home-hero-recs__viewport">
          {rail}
          {showCompactNav && canScrollLeft ? (
            <CarouselNavButton
              direction="left"
              label="Предыдущий вариант"
              onClick={() => scrollCompactByStep(-1)}
              className="home-hero-recs__nav home-hero-recs__nav--prev"
            />
          ) : null}
          {showCompactNav && canScrollRight ? (
            <CarouselNavButton
              direction="right"
              label="Следующий вариант"
              onClick={() => scrollCompactByStep(1)}
              className="home-hero-recs__nav home-hero-recs__nav--next"
            />
          ) : null}
        </div>
      ) : (
        rail
      )}
    </div>
  );
}
