import type { ReactNode } from "react";

import { Header } from "@/widgets/header/Header";

import { AuthKeyboardScrollFix } from "./AuthKeyboardScrollFix";

type AuthPageLayoutProps = {
  children: ReactNode;
  /** `start` — top-align (city select); avoids iOS focus-scroll on short pages */
  align?: "center" | "start";
};

export function AuthPageLayout({ children, align = "center" }: AuthPageLayoutProps) {
  return (
    <div className="auth-page-shell">
      <AuthKeyboardScrollFix />
      <Header />
      <div className="auth-page-shell__body">
        <main
          className={`auth-page-main${align === "start" ? " auth-page-main--start" : ""}`}
        >
          <div className="auth-page-main__inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
