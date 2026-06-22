"use client";

import { HomeExchangeCtaBanner } from "@/widgets/home-exchange-cta/HomeExchangeCtaBanner";
import { HomeFreeGiveawaySection } from "@/widgets/home-free-section/HomeFreeGiveawaySection";
import { HomeRecommendationsHeader } from "@/widgets/home-recommendations-header/HomeRecommendationsHeader";
import { HomeTopBlock } from "@/widgets/home-top-block/HomeTopBlock";
import { HomeSearchProvider } from "@/features/home-search";

export function HomePageContent() {
  return (
    <HomeSearchProvider>
      <main className="min-h-screen w-full shrink-0 overflow-x-hidden">
        <HomeTopBlock />
        <HomeFreeGiveawaySection />
        <HomeExchangeCtaBanner />
        <HomeRecommendationsHeader />
      </main>
    </HomeSearchProvider>
  );
}
