import type { Metadata } from "next";
import { Golos_Text, Manrope } from "next/font/google";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
