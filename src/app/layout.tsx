import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Waterloot — UWaterloo Student Marketplace",
  description:
    "Buy and sell with fellow University of Waterloo students. Verified students only.",
  openGraph: {
    title: "Waterloot — UWaterloo Student Marketplace",
    description:
      "Buy and sell with fellow University of Waterloo students. Verified students only.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
