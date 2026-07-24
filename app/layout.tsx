import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RopeProperties — Premium Nigerian Real Estate",
    template: "%s | RopeProperties",
  },
  description:
    "Buy, rent, and invest in premium Nigerian property with RopeProperties. A Lagos-based real estate firm serving discerning clients.",
  metadataBase: new URL("https://ropeproperties.com"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "RopeProperties",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}