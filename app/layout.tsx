import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import DustParticles from "@/components/DustParticles";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "theoldman.keeps — Everyone has something to say.",
  description:
    "A quiet place for questions worth answering and thoughts worth leaving behind.",
  keywords: [
    "anonymous responses",
    "daily question",
    "literary journal",
    "journaling",
    "theoldman keeps",
    "oldman keeps",
    "quiet reflection",
  ],
  authors: [{ name: "theoldman.keeps" }],
  openGraph: {
    title: "theoldman.keeps — Everyone has something to say.",
    description:
      "A quiet place for questions worth answering and thoughts worth leaving behind.",
    url: "https://oldman-keeps.vercel.app",
    siteName: "theoldman.keeps",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "theoldman.keeps",
    description: "Everyone has something to say.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EFE6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body className="paper-texture font-sans antialiased text-ink min-h-screen flex flex-col selection:bg-brass-light/30 selection:text-ink relative overflow-x-hidden">
        <DustParticles />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
