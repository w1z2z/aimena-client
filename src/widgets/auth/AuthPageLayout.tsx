import type { ReactNode } from "react";

import { Header } from "@/widgets/header/Header";

import { AuthKeyboardScrollFix } from "./AuthKeyboardScrollFix";

type AuthPageLayoutProps = {
  children: ReactNode;
};

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="auth-page-shell">
      <AuthKeyboardScrollFix />
      <Header />
      <div className="auth-page-shell__body">
        <main className="auth-page-main">
          <div className="auth-page-main__inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
