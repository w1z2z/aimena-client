"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { ListingCard, ListingCardSkeleton, type ListingCardData } from "@/entities/listing";

import {
  HeroCompactRecommendationRow,
  HeroCompactRecommendationRowSkeleton,
} from "./HeroCompactRecommendationRow";

function HeroRecommendationsEmpty({
  isExchange,
  isAllCategory,
  compact = false,
}: {
  isExchange: boolean;
  isAllCategory: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "home-hero-recs__empty home-hero-recs__empty--compact"
          : "home-hero-recs__empty box-border flex h-[464px] w-[342px] flex-col items-center justify-center rounded-[31px] border-[3px] border-solid border-transparent px-[24px] py-[32px] text-center"
      }
      style={
        compact
          ? undefined
          : {
              background:
                "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%) border-box",
            }
      }
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

type HeroRecommendationsPanelProps = {
  heading: ReactNode;
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
  /** Compact: horizontal rows under the lime form (old card carousel hidden). */
  layout?: "desktop" | "compact";
};

type DisplayedRecommendations = {
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
};

function useDisplayedRecommendations({
  loading,
  listings,
  isExchange,
  isAllCategory,
}: {
  loading: boolean;
  listings: ListingCardData[];
  isExchange: boolean;
  isAllCategory: boolean;
}) {
  const [visible, setVisible] = useState(true);
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

  return { visible, displayed };
}

function HeroRecommendationsCompact({
  heading,
  loading,
  listings,
  isExchange,
  isAllCategory,
}: Omit<HeroRecommendationsPanelProps, "layout">) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollSettling, setScrollSettling] = useState(true);
  const { visible, displayed } = useDisplayedRecommendations({
    loading,
    listings,
    isExchange,
    isAllCategory,
  });

  const scrollKey = displayed.loading
    ? "loading"
    : displayed.listings.length > 0
      ? displayed.listings.map((item) => item.id).join("-")
      : "empty";

  const slideCount = displayed.loading
    ? 1
    : displayed.listings.length > 0
      ? displayed.listings.length
      : 1;
  const showPeek = !displayed.loading && displayed.listings.length > 1;

  const syncActiveIndex = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setActiveIndex(0);
      return;
    }

    const step = node.clientWidth;
    if (step <= 0) {
      setActiveIndex(0);
      return;
    }

    const gap = 12;
    const index = Math.round(node.scrollLeft / (step + gap));
    setActiveIndex(Math.max(0, Math.min(index, slideCount - 1)));
  }, [slideCount]);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !visible) return;

    setScrollSettling(true);
    node.scrollLeft = 0;
    setActiveIndex(0);

    const settleTimer = window.setTimeout(() => {
      node.scrollLeft = 0;
      setScrollSettling(false);
      syncActiveIndex();
    }, 80);

    return () => window.clearTimeout(settleTimer);
  }, [scrollKey, visible, syncActiveIndex]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    syncActiveIndex();
    node.addEventListener("scroll", syncActiveIndex, { passive: true });
    window.addEventListener("resize", syncActiveIndex);

    const frameId = window.requestAnimationFrame(syncActiveIndex);
    return () => {
      node.removeEventListener("scroll", syncActiveIndex);
      window.removeEventListener("resize", syncActiveIndex);
      window.cancelAnimationFrame(frameId);
    };
  }, [scrollKey, visible, syncActiveIndex]);

  return (
    <div className="home-hero-recs home-hero-recs--compact-rows">
      <div className="home-hero-recs__heading">
        <p className="home-hero-recs__heading-text">{heading}</p>
      </div>

      <div className="home-hero-recs__viewport home-hero-recs__viewport--rows">
        <div
          key={scrollKey}
          ref={scrollRef}
          className={`home-hero-recs__rail home-hero-recs__rail--rows${
            scrollSettling ? " is-scroll-settling" : ""
          } hero-recommendations-fade ${visible ? "is-visible" : "is-hidden"}`}
        >
          {displayed.loading ? (
            <div data-recommendation-card className="home-hero-recs__slide">
              <HeroCompactRecommendationRowSkeleton />
            </div>
          ) : displayed.listings.length > 0 ? (
            displayed.listings.map((listing) => (
              <div key={listing.id} data-recommendation-card className="home-hero-recs__slide">
                <HeroCompactRecommendationRow
                  listingId={listing.id}
                  title={listing.title}
                  city={listing.city}
                  coverImageUrl={listing.coverImageUrl}
                  wants={listing.wants}
                  wantCategories={listing.wantCategories}
                  isFree={listing.isFree}
                  ownerId={listing.ownerId}
                />
              </div>
            ))
          ) : (
            <div data-recommendation-card className="home-hero-recs__slide">
              <HeroRecommendationsEmpty
                compact
                isExchange={displayed.isExchange}
                isAllCategory={displayed.isAllCategory}
              />
            </div>
          )}
        </div>
      </div>

      {showPeek ? (
        <div className="home-hero-recs__dots" aria-hidden="true">
          {displayed.listings.map((listing, index) => (
            <span
              key={listing.id}
              className={`home-hero-recs__dot${index === activeIndex ? " is-active" : ""}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeroRecommendationsDesktop({
  heading,
  loading,
  listings,
  isExchange,
  isAllCategory,
}: Omit<HeroRecommendationsPanelProps, "layout">) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visible, displayed } = useDisplayedRecommendations({
    loading,
    listings,
    isExchange,
    isAllCategory,
  });

  const scrollKey = displayed.loading
    ? "loading"
    : displayed.listings.length > 0
      ? displayed.listings.map((item) => item.id).join("-")
      : "empty";

  const [scrollSettling, setScrollSettling] = useState(true);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !visible) return;

    setScrollSettling(true);
    node.scrollTop = 0;

    const settleTimer = window.setTimeout(() => {
      node.scrollTop = 0;
      setScrollSettling(false);
    }, 80);

    return () => window.clearTimeout(settleTimer);
  }, [scrollKey, visible]);

  return (
    <div className="home-hero-recs relative flex h-[560px] w-[464px] flex-col items-center gap-[24px] overflow-hidden rounded-[31px] bg-white p-[24px]">
      <div className="flex h-[24px] w-[330px] shrink-0 items-center justify-center text-center text-[#1A1A1A]">
        <p className="text-[24px] font-extrabold leading-none tracking-[-0.003em]">{heading}</p>
      </div>

      <div
        key={scrollKey}
        ref={scrollRef}
        className={`home-recommendations-scroll min-h-0 w-[366px] flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-[12px] [overflow-anchor:none]${
          scrollSettling ? " is-scroll-settling" : ""
        }`}
      >
        <div
          className={`hero-recommendations-fade flex flex-col items-center gap-[16px] ${
            visible ? "is-visible" : "is-hidden"
          }`}
        >
          {displayed.loading ? (
            <div data-recommendation-card>
              <ListingCardSkeleton />
            </div>
          ) : displayed.listings.length > 0 ? (
            displayed.listings.map((listing) => (
              <div
                key={listing.id}
                data-recommendation-card
                className="flex h-[464px] w-[342px] shrink-0 justify-center"
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
            <div data-recommendation-card>
              <HeroRecommendationsEmpty
                isExchange={displayed.isExchange}
                isAllCategory={displayed.isAllCategory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroRecommendationsPanel({
  heading,
  loading,
  listings,
  isExchange,
  isAllCategory,
  layout = "desktop",
}: HeroRecommendationsPanelProps) {
  if (layout === "compact") {
    return (
      <HeroRecommendationsCompact
        heading={heading}
        loading={loading}
        listings={listings}
        isExchange={isExchange}
        isAllCategory={isAllCategory}
      />
    );
  }

  return (
    <HeroRecommendationsDesktop
      heading={heading}
      loading={loading}
      listings={listings}
      isExchange={isExchange}
      isAllCategory={isAllCategory}
    />
  );
}
