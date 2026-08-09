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
    forcePageScrollTop();

    // Lock to top briefly: Next/scroll-anchoring sometimes nudges after paint.
    let locked = true;
    const unlockTimer = window.setTimeout(() => {
      locked = false;
    }, 700);

    const keepTop = () => {
      if (!locked) return;
      if ((document.scrollingElement?.scrollTop ?? window.scrollY) !== 0) {
        forcePageScrollTop();
      }
    };

    window.addEventListener("scroll", keepTop, { passive: true, capture: true });
    const intervalId = window.setInterval(keepTop, 50);

    return () => {
      locked = false;
      window.history.scrollRestoration = previous;
      window.clearTimeout(unlockTimer);
      window.clearInterval(intervalId);
      window.removeEventListener("scroll", keepTop, true);
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
