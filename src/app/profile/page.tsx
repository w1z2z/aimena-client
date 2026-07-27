"use client";

import { ProfileLayout } from "@/widgets/profile/ProfileLayout";
import { ProfileListingsPanel } from "@/widgets/profile/ProfileListingsPanel";

export default function ProfilePage() {
  return (
    <ProfileLayout active="listings">
      <ProfileListingsPanel />
    </ProfileLayout>
  );
}
