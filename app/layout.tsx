import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import {
  REALTOR_FULL_NAME,
  REALTOR_TITLE,
  BUSINESS_NAME,
  SITE_URL,
} from "@/lib/site";

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
    default: "Opeoluwa — Realtor | RopeProperties",
    template: "%s | Opeoluwa, RopeProperties",
  },
  description:
    "Buy, rent, and invest in premium Nigerian property with Opeoluwa — a Lagos-based realtor offering personal, straight-talking guidance from first viewing to handover.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "RopeProperties",
  },
};

// Tells search engines the site represents a person, not a firm.
const realtorJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: `${REALTOR_FULL_NAME} — ${BUSINESS_NAME}`,
  alternateName: BUSINESS_NAME,
  url: SITE_URL,
  areaServed: [
    { "@type": "City", name: "Lagos" },
    { "@type": "City", name: "Abuja" },
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
    addressRegion: "Lagos",
  },
  employee: {
    "@type": "Person",
    name: REALTOR_FULL_NAME,
    jobTitle: REALTOR_TITLE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realtorJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}