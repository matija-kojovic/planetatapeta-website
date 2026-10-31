import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { phoneDigits } from "@/lib/site";

export default function Footer({ contact }) {
  const digits = phoneDigits(contact.phone);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-paper lg:mt-32">
      <div className="page grid gap-12 py-14 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5">
          <p className="font-display text-[2rem] leading-none">planetatapeta</p>
          <p className="mt-4 max-w-[36ch] text-[#d7cfc2]">
            Foto tapete, zidni stikeri, slike na platnu i pleksiglasu i izrada nalepnica. Štampamo po meri, u Beogradu.
          </p>
        </div>

        <nav aria-label="Proizvodi u podnožju" className="md:col-span-3">
          <h2 className="font-sans text-[0.875rem] font-semibold text-[#d7cfc2]">Proizvodi</h2>
          <ul className="mt-4 grid gap-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="no-underline hover:underline">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-sans text-[0.875rem] font-semibold text-[#d7cfc2]">Kontakt</h2>
          <address className="mt-4 grid gap-2.5 not-italic">
            <span>
              {contact.address}, {contact.zip} {contact.city}
            </span>
            <a href={`tel:+${digits}`} className="no-underline hover:underline">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="break-all no-underline hover:underline">
              {contact.email}
            </a>
          </address>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
            {contact.instagram ? (
              <li>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                  Instagram
                </a>
              </li>
            ) : null}
            <li>
              <a href={`viber://chat?number=%2B${digits}`} className="underline-offset-4 hover:underline">
                Viber
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="page flex flex-col gap-3 py-6 text-[0.875rem] text-[#d7cfc2] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} PLANETATAPETA</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/politika-privatnosti" className="hover:text-paper">
                Politika privatnosti
              </Link>
            </li>
            <li>
              <Link href="/uslovi-koriscenja" className="hover:text-paper">
                Uslovi korišćenja
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
