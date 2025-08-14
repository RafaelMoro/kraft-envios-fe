import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { getThemePreference } from "@/shared/lib/preferences.lib";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kraft Envios",
  description: "Kraft envios es tu mejor solución para envio de paquetes en toda la República mexicana",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemePreference()

  return (
    <html lang="en" data-theme={theme}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-950 dark:text-gray-100 dark:bg-gray-950 transition-colors`}
      >
        <QueryProviderWrapper>
        {children}
        </QueryProviderWrapper>
      </body>
    </html>
  );
}
