import ContactForm from "@/components/shop/ContactForm";
import PageHeader from "@/components/shop/PageHeader";
import { getContent } from "@/lib/db";
import { instagramHandle, phoneDigits } from "@/lib/site";

export const metadata = {
  title: "Kontakt",
  description: "Pišite nam ili pozovite za upite o tapetama, stikerima, slikama na platnu i pleksiglasu i izradi nalepnica. Beograd.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = getContent();
  const digits = phoneDigits(contact.phone);
  const rows = [
    { label: "Telefon, Viber i WhatsApp", value: contact.phone, href: `tel:+${digits}` },
    { label: "E-adresa", value: contact.email, href: `mailto:${contact.email}` },
    ...(contact.instagram ? [{ label: "Instagram", value: instagramHandle(contact.instagram), href: contact.instagram, external: true }] : []),
  ];

  return (
    <>
      <PageHeader crumbs={[{ label: "Kontakt", href: "/contact" }]} title="Kontakt" size="section" />
      <div className="page grid gap-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-14">
        <section aria-labelledby="podaci">
          <h2 id="podaci" className="sr-only">
            Kontakt podaci
          </h2>
          <ul className="border-t border-ink">
            {rows.map(({ label, value, href, external }) => (
              <li key={label} className="border-b border-line py-[1.125rem] text-[1.0625rem]">
                <span className="t-label mb-1 block">{label}</span>
                {href ? (
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="link break-words">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </li>
            ))}
            <li className="flex flex-wrap gap-x-5 gap-y-1 border-b border-line py-[1.125rem] text-[0.9375rem]">
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="link">
                Pišite na WhatsApp
              </a>
              <a href={`viber://chat?number=%2B${digits}`} className="link">
                Pišite na Viber
              </a>
            </li>
          </ul>
        </section>
        <section aria-labelledby="poruka-naslov">
          <h2 id="poruka-naslov" className="sr-only">
            Pošaljite poruku
          </h2>
          <p className="t-lead mb-6">Opišite šta vam je potrebno, a mi ćemo vam poslati ponudu.</p>
          <ContactForm email={contact.email} />
        </section>
      </div>
    </>
  );
}
