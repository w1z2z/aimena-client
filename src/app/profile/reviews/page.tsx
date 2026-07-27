"use client";

import { ProfileLayout } from "@/widgets/profile/ProfileLayout";
import { ProfileReviewsPanel } from "@/widgets/profile/ProfileReviewsPanel";

export default function ProfileReviewsPage() {
  return (
    <ProfileLayout active="reviews">
      <ProfileReviewsPanel />
    </ProfileLayout>
  );
}
