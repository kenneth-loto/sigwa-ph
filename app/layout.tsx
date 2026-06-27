import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RscBoundaryProvider } from "@rsc-boundary/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sigwa PH",
    template: "%s — Sigwa PH",
  },
  description:
    "A dual-layer typhoon analytics dashboard focused on the Philippine Area of Responsibility. SigwaPH combines a historical storm database going back decades with a live advisory feed for active Western Pacific typhoons — both unified under a single analytical lens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="mx-auto flex min-h-full max-w-6xl flex-col px-6 py-8">
        <NuqsAdapter>
          <ThemeProvider>
            <RscBoundaryProvider>{children}</RscBoundaryProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
