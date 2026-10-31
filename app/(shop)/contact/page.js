import ContactForm from "@/components/shop/ContactForm";
import { ChatIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import PageHeader from "@/components/shop/PageHeader";
import { getContent } from "@/lib/db";
import { phoneDigits } from "@/lib/site";

export const metadata = {
  title: "Kontakt",
  description: "Pišite nam ili pozovite za upite o tapetama, stikerima, slikama na platnu i pleksiglasu i izradi nalepnica. Beograd.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = getContent();
  const digits = phoneDigits(contact.phone);
  const rows = [
    { icon: PhoneIcon, label: "Telefon", value: contact.phone, href: `tel:+${digits}` },
    { icon: MailIcon, label: "E-adresa", value: contact.email, href: `mailto:${contact.email}` },
    { icon: ChatIcon, label: "WhatsApp", value: contact.phone, href: `https://wa.me/${digits}`, external: true },
    { icon: ChatIcon, label: "Viber", value: contact.phone, href: `viber://chat?number=%2B${digits}` },
    { icon: PinIcon, label: "Adresa", value: `${contact.address}, ${contact.zip} ${contact.city}` },
    ...(contact.instagram ? [{ icon: InstagramIcon, label: "Instagram", value: "@planetatapeta", href: contact.instagram, external: true }] : []),
  ];

  return (
    <>
      <PageHeader crumbs={[{ label: "Kontakt", href: "/contact" }]} title="Kontakt" intro="Pitanja o meri, materijalu ili sopstvenom dizajnu? Pišite nam ili pozovite." />
      <div className="page grid gap-14 lg:grid-cols-12">
        <section aria-labelledby="podaci" className="lg:col-span-5">
          <h2 id="podaci" className="sr-only">
            Kontakt podaci
          </h2>
          <ul className="border-t border-ink">
            {rows.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label} className="flex gap-4 border-b border-line py-4">
                <Icon className="mt-0.5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="t-micro text-ink-2">{label}</p>
                  {href ? (
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="break-words font-semibold no-underline hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="poruka-naslov" className="lg:col-span-7">
          <h2 id="poruka-naslov" className="t-title mb-6">
            Pošaljite poruku
          </h2>
          <ContactForm email={contact.email} />
        </section>
      </div>
    </>
  );
}
