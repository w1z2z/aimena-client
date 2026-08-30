"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

import { HomeExchangeCtaBanner } from "@/widgets/home-exchange-cta/HomeExchangeCtaBanner";
import { HomeFreeGiveawaySection } from "@/widgets/home-free-section/HomeFreeGiveawaySection";
import { HomeRecommendationsHeader } from "@/widgets/home-recommendations-header/HomeRecommendationsHeader";
import { HomeTopBlock } from "@/widgets/home-top-block/HomeTopBlock";
import { HomeSearchProvider } from "@/features/home-search";
import { peekHomeTitleSearch } from "@/shared/lib/home-title-search";

function forcePageScrollTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) main.scrollTop = 0;
}

export function HomePageContent() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;
    // Search and category links scroll to the feed — don't fight them with a top lock.
    if (
      peekHomeTitleSearch() ||
      window.location.hash === "#home-recommendations"
    ) {
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    let cancelled = false;

    const cancel = () => {
      cancelled = true;
    };

    const pin = () => {
      if (!cancelled) forcePageScrollTop();
    };

    pin();

    const frameId = window.requestAnimationFrame(pin);
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    window.addEventListener("pointerdown", cancel, { passive: true, once: true });
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 1) cancel();
      },
      { passive: true },
    );

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.history.scrollRestoration = previous;
    };
  }, [pathname]);

  return (
    <HomeSearchProvider>
      <main className="min-h-screen w-full shrink-0 overflow-x-clip [overflow-anchor:none]">
        <HomeTopBlock />
        <HomeFreeGiveawaySection />
        <HomeExchangeCtaBanner />
        <HomeRecommendationsHeader />
      </main>
    </HomeSearchProvider>
  );
}
