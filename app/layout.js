import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import { getContent } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import PricingSync from "@/components/PricingSync";
import { syncPricing } from "@/lib/prices";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const grotesk = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-grotesk",
  display: "swap",
});

export function generateMetadata() {
  const { seo } = getContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: `%s | ${SITE_NAME}` },
    description: seo.description,
    applicationName: SITE_NAME,
    openGraph: { type: "website", locale: "sr_RS", siteName: SITE_NAME },
    formatDetection: { telephone: false },
  };
}

export const viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const prices = syncPricing();
  return (
    <html lang="sr-Latn" className={`${newsreader.variable} ${grotesk.variable}`}>
      <body>
        <PricingSync overrides={prices}>{children}</PricingSync>
      </body>
    </html>
  );
}
