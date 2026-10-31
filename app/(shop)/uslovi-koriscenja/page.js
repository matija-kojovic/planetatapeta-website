import LegalPlaceholder from "@/components/shop/LegalPlaceholder";
import { getContent } from "@/lib/db";

export const metadata = {
  title: "Uslovi korišćenja",
  robots: { index: false, follow: true },
};

// Topics required for distance selling under the Serbian Consumer Protection
// Law. The terms themselves must come from the business.
const SECTIONS = [
  "Podaci o prodavcu",
  "Postupak poručivanja i potvrda porudžbine",
  "Cene i načini plaćanja",
  "Dostava i ugradnja",
  "Proizvodi izrađeni po meri i pravo na odustanak",
  "Reklamacije",
  "Rešavanje sporova",
];

export default function TermsPage() {
  return <LegalPlaceholder title="Uslovi korišćenja" href="/uslovi-koriscenja" sections={SECTIONS} contact={getContent().contact} />;
}
