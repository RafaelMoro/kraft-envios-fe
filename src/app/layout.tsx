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
  title: {
    default: 'Kraft Envíos | Cotiza y genera guías con varias paqueterías',
    template: '%s | Kraft Envíos',
  },
  description: 'Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemePreference()

  return (
    <html lang="es-MX" data-theme={theme}>
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
