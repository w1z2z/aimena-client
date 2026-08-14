import type { Metadata } from "next";

import { AboutPageView } from "@/widgets/about/AboutPageView";

export const metadata: Metadata = {
  title: "О проекте — Aimena",
  description:
    "Как устроен обмен вещами и услугами в Aimena: объявления, предложения, чат и завершение сделки.",
};

export default function AboutPage() {
  return <AboutPageView />;
}
