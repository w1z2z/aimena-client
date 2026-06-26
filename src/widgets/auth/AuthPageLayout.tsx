import type { ReactNode } from "react";

import { Header } from "@/widgets/header/Header";

type AuthPageLayoutProps = {
  children: ReactNode;
};

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="pt-[54px]">
        <main className="flex min-h-[calc(100vh-54px)] items-center justify-center px-[16px] py-[48px]">
          <div className="w-full max-w-[604px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
