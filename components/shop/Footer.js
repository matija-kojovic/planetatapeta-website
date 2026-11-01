import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { phoneDigits, postalAddress } from "@/lib/site";

export default function Footer({ contact }) {
  const digits = phoneDigits(contact.phone);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-[4.5rem] bg-ink text-foot lg:mt-28">
      <div className="page grid gap-9 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)] md:gap-12 md:pb-[4.5rem] md:pt-20">
        <div>
          <p className="font-display text-[2rem] uppercase leading-none tracking-[0.06em]">PLANETATAPETA</p>
          <p className="mt-4 max-w-[36ch] text-foot-2">Foto tapete, zidni stikeri, slike na platnu i pleksiglasu i izrada nalepnica. Štampamo po meri, u Beogradu.</p>
        </div>

        <nav aria-label="Proizvodi u podnožju">
          <h2 className="font-sans text-[0.875rem] font-semibold tracking-normal text-foot-2">Proizvodi</h2>
          <ul className="mt-4 grid gap-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="no-underline underline-offset-[3px] hover:underline">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-[0.875rem] font-semibold tracking-normal text-foot-2">Kontakt</h2>
          <address className="mt-4 not-italic leading-[1.8]">
            {postalAddress(contact)}
            <br />
            <a href={`tel:+${digits}`} className="no-underline underline-offset-[3px] hover:underline">
              {contact.phone}
            </a>
            <br />
            <a href={`mailto:${contact.email}`} className="break-all no-underline underline-offset-[3px] hover:underline">
              {contact.email}
            </a>
          </address>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {contact.instagram ? (
              <li>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="no-underline underline-offset-[3px] hover:underline">
                  Instagram
                </a>
              </li>
            ) : null}
            <li>
              <a href={`viber://chat?number=%2B${digits}`} className="no-underline underline-offset-[3px] hover:underline">
                Viber
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="no-underline underline-offset-[3px] hover:underline">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-foot/20 text-[0.875rem] text-foot-2">
        <div className="page flex flex-col gap-3 py-[1.375rem] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} PLANETATAPETA</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/politika-privatnosti" className="hover:text-foot">
                Politika privatnosti
              </Link>
            </li>
            <li>
              <Link href="/uslovi-koriscenja" className="hover:text-foot">
                Uslovi korišćenja
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
