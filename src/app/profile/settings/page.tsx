"use client";

import { ProfileLayout } from "@/widgets/profile/ProfileLayout";
import { ProfileSettingsPanel } from "@/widgets/profile/ProfileSettingsPanel";

export default function ProfileSettingsPage() {
  return (
    <ProfileLayout active="settings">
      <ProfileSettingsPanel />
    </ProfileLayout>
  );
}
