"use client";

import { ProfileDealsPanel } from "@/widgets/profile/ProfileDealsPanel";
import { ProfileLayout } from "@/widgets/profile/ProfileLayout";

export default function ProfileDealsPage() {
  return (
    <ProfileLayout active="deals">
      <ProfileDealsPanel />
    </ProfileLayout>
  );
}
