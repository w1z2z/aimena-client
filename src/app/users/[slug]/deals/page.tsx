"use client";

import { PublicProfileDealsPanel } from "@/widgets/profile/PublicProfileDealsPanel";
import { PublicProfileLayout } from "@/widgets/profile/PublicProfileLayout";

export default function PublicProfileDealsPage() {
  return (
    <PublicProfileLayout active="deals">
      <PublicProfileDealsPanel />
    </PublicProfileLayout>
  );
}
