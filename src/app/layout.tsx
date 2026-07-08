import type { Metadata } from "next";
import { Golos_Text, Manrope } from "next/font/google";

import { AuthGateProvider, AuthProvider } from "@/features/auth";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { FloatingChat } from "@/widgets/floating-chat/FloatingChat";
import { SiteFooter } from "@/widgets/footer/SiteFooter";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aimena",
  description: "Frontend skeleton for Aimena marketplace",
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
            <AuthGateProvider>
              <div className="flex min-h-full flex-1 flex-col">{children}</div>
              <SiteFooter />
              <FloatingChat />
            </AuthGateProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
