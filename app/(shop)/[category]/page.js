import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlexiglassConfigurator from "@/components/configurators/PlexiglassConfigurator";
import StickerPrintConfigurator from "@/components/configurators/StickerPrintConfigurator";
import DesignCard from "@/components/shop/DesignCard";
import FixedProducts from "@/components/shop/FixedProducts";
import JsonLd from "@/components/shop/JsonLd";
import PageHeader from "@/components/shop/PageHeader";
import { PlexiglassGlyph, StickerSheetGlyph } from "@/components/shop/ProductGlyph";
import RateTable from "@/components/shop/RateTable";
import { CATEGORIES, collectionCover, collectionHref, getCategory, getCollections, getDesigns } from "@/lib/catalog";
import { getContent } from "@/lib/db";
import { PRICING, priceTeaser } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/site";

// Unknown slugs get notFound() below. Not `dynamicParams = false`: with it, the
// on-demand revalidation after an admin edit fails (NoFallbackError) and turns
// every prerendered page of this route into a 404 until the next deploy.
export const generateStaticParams = () => CATEGORIES.map((c) => ({ category: c.slug }));

export async function generateMetadata({ params }) {
  const category = getCategory((await params).category);
  if (!category) return {};
  return {
    title: `${category.label} po meri`,
    description: `${category.summary} ${category.intro}`.slice(0, 160),
    alternates: { canonical: `/${category.slug}` },
    openGraph: { title: `${category.label} | PLANETATAPETA`, url: `/${category.slug}` },
  };
}

function CollectionIndex({ category }) {
  const collections = getCollections(category.slug);
  return (
    <section aria-labelledby="kolekcije" className="page">
      <h2 id="kolekcije" className="sr-only">
        Kolekcije
      </h2>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => {
          const cover = collectionCover(category.slug, collection.slug);
          return (
            <li key={collection.slug}>
              <Link href={collectionHref(category.slug, collection.slug)} className="card-link block">
                <div className="board !aspect-[4/3]">
                  {cover ? (
                    <Image src={cover.src} alt="" width={cover.width} height={cover.height} priority={index < 3} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="card-title t-title">{collection.label}</h3>
                  <span className="t-micro tabular shrink-0 text-ink-2">{collection.count} dizajna</span>
                </div>
                {collection.description ? <p className="mt-1 text-ink-2">{collection.description}</p> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CanvasIndex() {
  const designs = getDesigns("slike-na-platnu");
  return (
    <section aria-labelledby="motivi" className="page">
      <h2 id="motivi" className="sr-only">
        Motivi
      </h2>
      <p className="t-small mb-6 text-ink-2">{designs.length} motiva</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {designs.map((design, index) => (
          <li key={design.id}>
            <DesignCard design={design} meta="1, 3 ili 5 delova" priority={index < 4} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConfiguratorSection({ category, email }) {
  const isPlexi = category.slug === "slike-na-pleksiglasu";
  return (
    <section className="page grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div className="grid aspect-[5/4] place-items-center bg-board p-[10%]">
            {isPlexi ? <PlexiglassGlyph className="h-full w-auto" /> : <StickerSheetGlyph className="h-full w-auto" />}
          </div>
          <p className="t-micro mt-3 text-ink-2">Skica proizvoda</p>
          <div className="mt-8 grid gap-3 text-ink-2">
            {isPlexi ? (
              <>
                <p>Motiv štampamo na akrilnom staklu (pleksiglasu). U napomeni opišite šta želite da odštampamo.</p>
                <p>Posle slanja porudžbine dobićete broj porudžbine. Fotografiju ili pripremu pošaljite e-poštom uz taj broj.</p>
              </>
            ) : (
              <>
                <p>
                  Cena se računa po površini: {String(PRICING["izrada-nalepnica"].pricePerCm2).replace(".", ",")} RSD po kvadratnom centimetru, pomnoženo sa brojem komada.
                </p>
                <p>Materijal, sečenje i rok izrade ne menjaju cenu. Pojedinačno pakovanje se doplaćuje po komadu.</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-6">
        {isPlexi ? <PlexiglassConfigurator email={email} /> : <StickerPrintConfigurator email={email} />}
      </div>
    </section>
  );
}

export default async function CategoryPage({ params }) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const { contact } = getContent();
  const withRates = category.slug === "tapete" || category.slug === "zidni-stikeri";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.label,
          description: category.summary,
          url: absoluteUrl(`/${category.slug}`),
        }}
      />
      <PageHeader
        crumbs={[{ label: category.label, href: `/${category.slug}` }]}
        title={category.label}
        intro={category.intro}
        aside={withRates ? <RateTable category={category.slug} /> : <p className="tabular text-right font-display text-[1.75rem]">{priceTeaser(category.slug)}</p>}
      />

      {category.hasDesigns && category.slug !== "slike-na-platnu" ? <CollectionIndex category={category} /> : null}
      {category.slug === "slike-na-platnu" ? <CanvasIndex /> : null}
      {!category.hasDesigns ? <ConfiguratorSection category={category} email={contact.email} /> : null}

      <FixedProducts category={category.slug} />
    </>
  );
}
