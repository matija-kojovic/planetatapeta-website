import { EB_Garamond, Schibsted_Grotesk } from "next/font/google";
import { getContent } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-garamond",
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
  themeColor: "#f9f0e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr-Latn" className={`${garamond.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
