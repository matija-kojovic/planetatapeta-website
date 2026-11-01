import Image from "next/image";
import Link from "next/link";
import DesignCard from "@/components/shop/DesignCard";
import { Elevation } from "@/components/shop/Dimension";
import JsonLd from "@/components/shop/JsonLd";
import { PlexiglassGlyph, StickerSheetGlyph } from "@/components/shop/ProductGlyph";
import { CATEGORIES, CATEGORY_COVERS, HERO_DESIGN_ID, featuredDesigns, getCollection, getDesign } from "@/lib/catalog";
import { getContent } from "@/lib/db";
import { FAQ } from "@/lib/faq";
import { formatRSD } from "@/lib/format";
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
    return <Image src={design.src} alt="" width={design.width} height={design.height} sizes="112px" className="max-h-full w-auto object-contain" />;
  }
  return slug === "slike-na-pleksiglasu" ? <PlexiglassGlyph className="h-full w-full" /> : <StickerSheetGlyph className="h-full w-full" />;
}

export default function HomePage() {
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
            streetAddress: contact.address,
            ...(contact.zip ? { postalCode: contact.zip } : {}),
            addressLocality: contact.city,
            addressCountry: "RS",
          },
          sameAs: contact.instagram ? [contact.instagram] : [],
        }}
      />

      {/* Hero: a wall drawn as an elevation */}
      <section className="page grid gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-5">
          <h1 className="t-hero">{hero.title}</h1>
          <p className="t-lead measure mt-6 text-ink-2">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tapete" className="btn btn-primary">
              {hero.buttonText}
            </Link>
            <Link href="#kako-poruciti" className="btn btn-secondary">
              Kako poručiti
            </Link>
          </div>
        </div>

        <figure className="lg:col-span-7">
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
          <figcaption className="t-small mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pr-8 text-ink-2">
            <span>
              Primer: {heroDesign.name}, materijal Klasik, zid {wallWidth} × {wallHeight} cm.
            </span>
            <span className="tabular text-ink">
              Ukupno <strong className="font-semibold">{formatRSD(example.total)}</strong>
            </span>
          </figcaption>
        </figure>
      </section>

      {/* Category index */}
      <section aria-labelledby="ponuda" className="page">
        <h2 id="ponuda" className="t-section border-b border-ink pb-4">
          Šta štampamo
        </h2>
        <ul>
          {CATEGORIES.map((category) => (
            <li key={category.slug} className="border-b border-line">
              <Link
                href={`/${category.slug}`}
                className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-1 py-5 no-underline sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-x-8"
              >
                <div className="row-span-2 grid aspect-square place-items-center bg-board p-2 sm:row-span-1 sm:p-3">
                  <CategoryThumb slug={category.slug} />
                </div>
                <div>
                  <h3 className="t-title group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{category.label}</h3>
                  <p className="mt-1 hidden text-ink-2 sm:block">{category.summary}</p>
                </div>
                <p className="tabular t-small text-ink-2 sm:text-right sm:text-[0.9375rem] sm:text-ink">{priceTeaser(category.slug)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured designs */}
      <section aria-labelledby="iz-kataloga" className="page mt-20 lg:mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="iz-kataloga" className="t-section">
            Iz kataloga
          </h2>
          <Link href="/tapete" className="link">
            Sve kolekcije tapeta
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {featured.map((design) => (
            <li key={design.id}>
              <DesignCard design={design} meta={getCollection(design.category, design.collection)?.label} />
            </li>
          ))}
        </ul>
      </section>

      {/* Ordering steps — a real sequence, so they are numbered */}
      <section id="kako-poruciti" aria-labelledby="kako-poruciti-naslov" className="page mt-20 lg:mt-28">
        <h2 id="kako-poruciti-naslov" className="t-section">
          Kako poručiti
        </h2>
        <ol className="mt-8 grid gap-px border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, text], index) => (
            <li key={title} className="flex gap-5 bg-paper py-6 sm:flex-col sm:gap-3 sm:py-8 sm:pr-8 lg:[&:not(:first-child)]:pl-8">
              <span className="font-display text-[2.75rem] leading-none text-gold" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="font-sans text-[1.0625rem] font-semibold">{title}</h3>
                <p className="mt-1.5 text-ink-2">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Own design */}
      <section aria-labelledby="svoj-motiv" className="mt-20 bg-board lg:mt-28">
        <div className="page grid gap-8 py-14 lg:grid-cols-12 lg:py-20">
          <h2 id="svoj-motiv" className="t-section lg:col-span-5">
            Imate svoj motiv?
          </h2>
          <div className="lg:col-span-7">
            <p className="t-lead measure">
              Štampamo i vaše fotografije i gotove pripreme. Prihvatamo vektorske fajlove i fotografije visoke rezolucije, a ako nemate pripremu, opišite ideju i dogovorićemo dizajn.
            </p>
            <p className="measure mt-4 text-ink-2">
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
      <section aria-labelledby="pitanja" className="page faq mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12">
        <h2 id="pitanja" className="t-section lg:col-span-4">
          Česta pitanja
        </h2>
        <div className="border-t border-ink lg:col-span-8">
          {FAQ.map((item) => (
            <details key={item.question} className="border-b border-line">
              <summary className="flex min-h-14 items-center justify-between gap-6 py-4 text-[1.0625rem] font-semibold">
                {item.question}
                <span className="faq-icon grid size-8 shrink-0 place-items-center text-gold" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </span>
              </summary>
              <p className="measure pb-6 text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
