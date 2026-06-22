import { HomeExchangeCtaBanner } from "@/widgets/home-exchange-cta/HomeExchangeCtaBanner";
import { HomeFreeGiveawaySection } from "@/widgets/home-free-section/HomeFreeGiveawaySection";
import { HomeTopBlock } from "@/widgets/home-top-block/HomeTopBlock";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full shrink-0 overflow-x-hidden">
      <HomeTopBlock />
      <HomeFreeGiveawaySection />
      <HomeExchangeCtaBanner />
    </main>
  );
}
