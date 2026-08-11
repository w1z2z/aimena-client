"use client";

import type { ReactNode } from "react";

import { PublicProfileLayout } from "@/widgets/profile/PublicProfileLayout";

export default function UserPublicProfileLayout({ children }: { children: ReactNode }) {
  return <PublicProfileLayout>{children}</PublicProfileLayout>;
}
