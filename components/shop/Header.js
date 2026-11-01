import Link from "next/link";
import { CATEGORIES, allDesigns, designHref, getCollections } from "@/lib/catalog";
import { syncPricing } from "@/lib/prices";
import { priceTeaser } from "@/lib/pricing";
import { phoneDigits } from "@/lib/site";
import { CartLink, DesktopNav, MobileMenu, SearchDialog } from "./HeaderClient";

/** Everything search looks through: categories, collections and designs (name, link, context, image). */
function searchIndex() {
  const collections = CATEGORIES.flatMap((c) => getCollections(c.slug).map((col) => ({ ...col, categoryLabel: c.label })));
  const collectionLabel = (d) => collections.find((c) => c.category === d.category && c.slug === d.collection)?.label || "";
  return [
    ...CATEGORIES.map((c) => ({ name: c.label, href: `/${c.slug}`, context: "Kategorija" })),
    ...collections
      .filter((c) => c.category !== "slike-na-platnu")
      .map((c) => ({ name: c.label, href: `/${c.category}/${c.slug}`, context: `Kolekcija, ${c.categoryLabel.toLowerCase()}` })),
    ...allDesigns().map((d) => ({ name: d.name, href: designHref(d), context: d.category === "slike-na-platnu" ? "Slike na platnu" : collectionLabel(d), src: d.src })),
  ];
}

export default function Header({ announcement, contact }) {
  syncPricing();
  const nav = [
    { href: "/", label: "Početna", navLabel: "Početna" },
    ...CATEGORIES.map(({ slug, label, navLabel }) => ({ href: `/${slug}`, label, navLabel, teaser: priceTeaser(slug) })),
    { href: "/contact", label: "Kontakt", navLabel: "Kontakt" },
  ];
  const tel = `tel:+${phoneDigits(contact.phone)}`;

  return (
    <header>
      {/* Utility bar: what we do (or the admin's announcement), phone and Instagram */}
      <div className="bg-teal text-[0.8125rem] text-util">
        <div className="page flex min-h-[2.375rem] flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1.5 lg:justify-between">
          <p className={announcement ? "text-center" : "hidden lg:block"}>{announcement || "Foto tapete, zidni stikeri i slike — štampa po meri"}</p>
          <p className="flex gap-6">
            <a href={tel} className="no-underline hover:underline">
              {contact.phone}
            </a>
            {contact.instagram ? (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="hidden no-underline hover:underline lg:inline">
                Instagram
              </a>
            ) : null}
          </p>
        </div>
      </div>

      {/* Masthead: search, centred wordmark, cart */}
      <div className="page grid min-h-[4.125rem] grid-cols-[3.25rem_minmax(0,1fr)_3.25rem] items-center lg:min-h-24 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-5">
          <MobileMenu items={nav} phone={contact.phone} />
          <SearchDialog index={searchIndex()} />
        </div>
        <Link href="/" className="text-center leading-none no-underline" aria-label="PLANETATAPETA, početna strana">
          <span className="block font-display text-[1.3rem] font-medium tracking-[0.12em] lg:text-[1.9375rem] lg:tracking-[0.2em]">PLANETATAPETA</span>
          <span className="mt-2.5 hidden text-[0.65625rem] font-medium uppercase tracking-[0.3em] text-ink-2 lg:block">Štampa po meri · Beograd</span>
        </Link>
        <div className="flex justify-end">
          <CartLink />
        </div>
      </div>

      <DesktopNav items={nav} />
    </header>
  );
}
