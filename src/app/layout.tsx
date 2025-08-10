import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProviderWrapper>
        {children}
        </QueryProviderWrapper>
      </body>
    </html>
  );
}
