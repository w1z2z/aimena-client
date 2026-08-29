import type { Metadata } from "next";
import { Golos_Text, Manrope } from "next/font/google";
import { Suspense } from "react";

import { AuthGateProvider, AuthProvider } from "@/features/auth";
import { ChatInboxProvider } from "@/features/chat-inbox";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { ScrollToTopOnRouteChange } from "@/shared/ui/ScrollToTopOnRouteChange";
import { MobileFormFocusPin } from "@/shared/ui/MobileFormFocusPin";
import { FloatingChat } from "@/widgets/floating-chat/FloatingChat";
import { SiteFooter } from "@/widgets/footer/SiteFooter";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "Aimena",
  description: "Обмен вещами и услугами без продаж",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${golosText.variable} antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <AuthProvider>
            <ChatInboxProvider>
              <AuthGateProvider>
                <Suspense fallback={null}>
                  <ScrollToTopOnRouteChange />
                </Suspense>
                <MobileFormFocusPin />
                <div className="flex min-h-full flex-1 flex-col">{children}</div>
                <SiteFooter />
                <FloatingChat />
              </AuthGateProvider>
            </ChatInboxProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
