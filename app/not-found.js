import Link from "next/link";
import SiteChrome from "@/components/shop/SiteChrome";
import { CATEGORIES } from "@/lib/catalog";

export const metadata = { title: "Stranica nije pronađena", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="page grid gap-10 pb-8 pt-14 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-6">
          <p className="tabular font-display text-[5rem] leading-none text-gold">404</p>
          <h1 className="t-page mt-4">Ova stranica ne postoji</h1>
          <p className="t-lead measure mt-5 text-ink-2">Možda je adresa pogrešno upisana ili je stranica premeštena. Pogledajte ponudu ili se vratite na početnu.</p>
          <Link href="/" className="btn btn-primary mt-8">
            Na početnu
          </Link>
        </div>
        <nav aria-label="Ponuda" className="lg:col-span-5 lg:col-start-8">
          <ul className="border-t border-ink">
            {CATEGORIES.map((c) => (
              <li key={c.slug} className="border-b border-line">
                <Link href={`/${c.slug}`} className="flex min-h-14 items-center font-display text-[1.375rem] no-underline hover:underline">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </SiteChrome>
  );
}
