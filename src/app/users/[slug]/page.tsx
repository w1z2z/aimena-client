"use client";

import { PublicProfileLayout } from "@/widgets/profile/PublicProfileLayout";
import { PublicProfileListingsPanel } from "@/widgets/profile/PublicProfileListingsPanel";

export default function PublicProfilePage() {
  return (
    <PublicProfileLayout active="listings">
      <PublicProfileListingsPanel />
    </PublicProfileLayout>
  );
}
