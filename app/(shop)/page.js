import Image from "next/image";
import Link from "next/link";
import DesignCard from "@/components/shop/DesignCard";
import { Elevation } from "@/components/shop/Dimension";
import SectionHead from "@/components/shop/SectionHead";
import { ArrowIcon } from "@/components/icons";
import JsonLd from "@/components/shop/JsonLd";
import { PlexiglassGlyph, StickerSheetGlyph } from "@/components/shop/ProductGlyph";
import { CATEGORIES, CATEGORY_COVERS, HERO_DESIGN_ID, featuredDesigns, getCollection, getDesign } from "@/lib/catalog";
import { getContent } from "@/lib/db";
import { FAQ } from "@/lib/faq";
import { formatRSD } from "@/lib/format";
import { syncPricing } from "@/lib/prices";
import { calculatePrice, priceTeaser } from "@/lib/pricing";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const STEPS = [
  ["Izaberite dizajn", "Pregledajte kolekcije tapeta, stikera i slika na platnu, ili pošaljite svoj motiv."],
  ["Unesite mere", "Upišite širinu i visinu zida ili izaberite gotovu dimenziju. Cenu vidite odmah."],
  ["Pošaljite porudžbinu", "Ostavite kontakt i adresu za dostavu. Na sajtu se ne plaća karticom."],
  ["Potvrđujemo detalje", "Javljamo vam se radi potvrde porudžbine, dostave i ugradnje, ako ste je izabrali."],
];

function CategoryThumb({ slug }) {
  const design = CATEGORY_COVERS[slug] && getDesign(CATEGORY_COVERS[slug]);
  if (design) {
    return <Image src={design.src} alt="" width={design.width} height={design.height} sizes="132px" className="h-full w-full object-cover" />;
  }
  return slug === "slike-na-pleksiglasu" ? <PlexiglassGlyph className="h-full w-full p-1" /> : <StickerSheetGlyph className="h-full w-full p-1" />;
}

export default function HomePage() {
  syncPricing();
  const { hero, contact } = getContent();
  const heroDesign = getDesign(HERO_DESIGN_ID);
  // The wall is drawn in the design's own proportions, so nothing is cropped.
  const wallWidth = 300;
  const wallHeight = Math.round((wallWidth * heroDesign.height) / heroDesign.width / 10) * 10;
  const example = calculatePrice("tapete", { material: "klasik", width: wallWidth, height: wallHeight, installation: false });
  const featured = featuredDesigns();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "PLANETATAPETA",
          url: SITE_URL,
          image: absoluteUrl("/opengraph-image.jpg"),
          logo: absoluteUrl("/icon.png"),
          email: contact.email,
          telephone: contact.phone,
          address: {
            "@type": "PostalAddress",
            addressLocality: contact.city,
            addressCountry: "RS",
          },
          sameAs: contact.instagram ? [contact.instagram] : [],
        }}
      />

      {/* Hero: a wall drawn as an elevation */}
      <section className="page grid gap-9 pb-16 pt-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:pb-[6.5rem] lg:pt-[4.5rem]">
        <div>
          <h1 className="t-hero">{hero.title}</h1>
          <p className="t-lead mt-6 max-w-[42ch]">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tapete" className="btn btn-primary">
              {hero.buttonText}
            </Link>
            <Link href="#kako-poruciti" className="btn btn-secondary">
              Kako poručiti
            </Link>
          </div>
        </div>

        <figure>
          <Elevation widthLabel={`${wallWidth} cm`} heightLabel={`${wallHeight} cm`} ratio={`${heroDesign.width} / ${heroDesign.height}`}>
            <Image
              src={heroDesign.src}
              alt={`${heroDesign.name}, prikazana kao zid širine ${wallWidth} i visine ${wallHeight} cm`}
              fill
              priority
              sizes="(min-width: 1024px) 56vw, 92vw"
              className="object-contain"
            />
          </Elevation>
          <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pr-[2.875rem] text-[0.875rem] text-ink-2">
            <span>
              Primer: {heroDesign.name}, materijal Klasik, zid {wallWidth} × {wallHeight} cm.
            </span>
            <span className="tabular">
              Ukupno <strong className="font-semibold text-ink">{formatRSD(example.total)}</strong>
            </span>
          </figcaption>
        </figure>
      </section>

      {/* Category index */}
      <section aria-labelledby="ponuda" className="page">
        <SectionHead id="ponuda" title="Šta štampamo">
          <p className="max-w-[44ch] text-ink-2">Pet vrsta proizvoda, svaki po vašoj meri. Cene su početne i zavise od dimenzija i materijala.</p>
        </SectionHead>
        <ol className="border-t border-ink">
          {CATEGORIES.map((category, index) => (
            <li key={category.slug} className="border-b border-line">
              <Link
                href={`/${category.slug}`}
                className="group grid grid-cols-[1.75rem_minmax(0,1fr)_1.25rem] items-center gap-x-3.5 gap-y-1 px-1 py-[1.125rem] no-underline transition-colors hover:bg-field md:grid-cols-[2.75rem_8.25rem_minmax(0,1fr)_10.625rem_1.5rem] md:gap-7 md:px-3 md:py-5"
              >
                <span className="tabular font-display text-[1.0625rem] text-ink-2 md:text-[1.25rem]">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden h-[5.5rem] w-[8.25rem] overflow-hidden bg-board md:block">
                  <CategoryThumb slug={category.slug} />
                </span>
                <span>
                  <h3 className="t-title transition-colors group-hover:text-teal">{category.label}</h3>
                  <span className="mt-1 hidden text-[0.9375rem] text-ink-2 md:block">{category.summary}</span>
                </span>
                <span className="col-start-3 row-start-1 flex text-teal md:col-start-auto md:row-start-auto md:order-last">
                  <ArrowIcon size={22} />
                </span>
                <span className="tabular col-start-2 text-[0.875rem] font-medium md:col-start-auto md:text-right md:text-[0.9375rem]">{priceTeaser(category.slug)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured designs */}
      <section aria-labelledby="iz-kataloga" className="page mt-[4.5rem] lg:mt-28">
        <SectionHead id="iz-kataloga" title="Iz kataloga">
          <Link href="/tapete" className="link">
            Sve kolekcije tapeta
          </Link>
        </SectionHead>
        <ul className="grid grid-cols-2 gap-x-3.5 gap-y-7 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {featured.map((design) => (
            <li key={design.id}>
              <DesignCard design={design} meta={getCollection(design.category, design.collection)?.label} price={priceTeaser(design.category)} />
            </li>
          ))}
        </ul>
      </section>

      {/* Ordering steps — a real sequence, so they are numbered */}
      <section id="kako-poruciti" aria-labelledby="kako-poruciti-naslov" className="page mt-[4.5rem] lg:mt-28">
        <SectionHead id="kako-poruciti-naslov" title="Kako poručiti" />
        <ol className="grid gap-px border-y border-line bg-line lg:grid-cols-4">
          {STEPS.map(([title, text], index) => (
            <li key={title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3.5 gap-y-0.5 bg-paper py-[1.375rem] lg:block lg:py-8 lg:pr-7 lg:[&:not(:first-child)]:pl-7">
              <span className="row-span-2 font-display text-[2.5rem] leading-none text-teal lg:block lg:text-[3.25rem]" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="font-sans text-[1.0625rem] font-semibold tracking-normal lg:mt-[1.125rem]">{title}</h3>
              <p className="mt-1.5 text-ink-2">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Own design */}
      <section aria-labelledby="svoj-motiv" className="mt-[4.5rem] bg-board lg:mt-28">
        <div className="page grid gap-5 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-[5.5rem]">
          <h2 id="svoj-motiv" className="t-section">
            Imate svoj motiv?
          </h2>
          <div>
            <p className="t-lead">
              Štampamo i vaše fotografije i gotove pripreme. Prihvatamo vektorske fajlove i fotografije visoke rezolucije, a ako nemate pripremu, opišite ideju i dogovorićemo dizajn.
            </p>
            <p className="mt-4 max-w-[56ch] text-ink-2">
              Možete izabrati i bilo koji motiv sa{" "}
              <a href="https://www.shutterstock.com/" target="_blank" rel="noopener noreferrer" className="link">
                Shutterstock galerije
              </a>{" "}
              i poslati nam link do njega.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Pošaljite upit
              </Link>
              <Link href="/slike-na-pleksiglasu" className="btn btn-secondary">
                Slika na pleksiglasu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="pitanja" className="page faq mt-[4.5rem] grid gap-5 lg:mt-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <h2 id="pitanja" className="t-section">
          Česta pitanja
        </h2>
        <div className="border-t border-ink">
          {FAQ.map((item) => (
            <details key={item.question} className="border-b border-line">
              <summary className="flex min-h-[3.625rem] items-center justify-between gap-6 py-4 text-[1.0625rem] font-semibold">
                {item.question}
                <span className="faq-icon grid size-8 shrink-0 place-items-center text-teal" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-[62ch] pb-[1.375rem] text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
