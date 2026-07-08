import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppProvider } from "@/lib/context/app-context";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "METIS — Your Learning GPS",
  description:
    "METIS is your learning GPS: AI-guided, adaptive roadmaps that turn any goal into a precise, resourced path.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${ebGaramond.variable}`}
    >
      <body className="min-h-screen bg-background font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
