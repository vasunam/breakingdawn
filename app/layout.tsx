import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AppProvider } from "@/components/app-provider";
import { PwaRegistrar } from "@/components/pwa-registrar";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Luna Cycle",
  description: "Private, mobile-first cycle tracking with low-friction logging.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "Luna Cycle",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#090B10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>
        <AuthProvider>
          <AppProvider>
            <PwaRegistrar />
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
