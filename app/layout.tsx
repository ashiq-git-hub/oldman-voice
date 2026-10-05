import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
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
  title: "oldman.voice — Everyone has something to say.",
  description:
    "A quiet place for questions worth answering and thoughts worth leaving behind.",
  keywords: [
    "anonymous responses",
    "daily question",
    "literary journal",
    "journaling",
    "oldman voice",
    "quiet reflection",
  ],
  authors: [{ name: "oldman.voice" }],
  openGraph: {
    title: "oldman.voice — Everyone has something to say.",
    description:
      "A quiet place for questions worth answering and thoughts worth leaving behind.",
    url: "https://oldman-voice.vercel.app",
    siteName: "oldman.voice",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "oldman.voice",
    description: "Everyone has something to say.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F0E7",
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
      <body className="paper-texture font-sans antialiased text-ink min-h-screen flex flex-col selection:bg-brass-light/30 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
