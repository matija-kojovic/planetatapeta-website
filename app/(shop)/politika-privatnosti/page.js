import LegalPlaceholder from "@/components/shop/LegalPlaceholder";
import { getContent } from "@/lib/db";

export const metadata = {
  title: "Politika privatnosti",
  robots: { index: false, follow: true },
};

// Sections a privacy notice under the Serbian Law on Personal Data Protection
// (ZZPL) is expected to cover. The text itself must come from the business.
const SECTIONS = [
  "Rukovalac podacima i kontakt",
  "Koje podatke prikupljamo (porudžbina, kontakt forma)",
  "Svrha i pravni osnov obrade",
  "Koliko dugo čuvamo podatke",
  "Kome se podaci prosleđuju (dostava, e-pošta, hosting)",
  "Vaša prava i kako ih ostvariti",
  "Pravo na pritužbu Povereniku",
];

export default function PrivacyPage() {
  return <LegalPlaceholder title="Politika privatnosti" href="/politika-privatnosti" sections={SECTIONS} contact={getContent().contact} />;
}
