import type { Metadata } from "next";
import { Golos_Text, Manrope } from "next/font/google";

import { FloatingChat } from "@/widgets/floating-chat/FloatingChat";

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
  title: "Swaply",
  description: "Frontend skeleton for Swaply marketplace",
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
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
