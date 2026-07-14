import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AppProvider } from "@/lib/context/app-context";
import "./globals.css";

// Distinct pairing (not one font everywhere): Poppins for headlines only,
// Inter for all body/UI text so paragraphs read neutral and legible.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "METIS · Your Learning GPS",
  description:
    "METIS is an AI-powered learning GPS. Tell it what you want to learn and it builds an adaptive roadmap that re-plans around you.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${poppins.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProvider>{children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
