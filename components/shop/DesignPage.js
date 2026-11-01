import Link from "next/link";
import CanvasConfigurator from "@/components/configurators/CanvasConfigurator";
import WallConfigurator from "@/components/configurators/WallConfigurator";
import { collectionHref, designHref, getCategory, getCollection, getDesigns } from "@/lib/catalog";
import { syncPricing } from "@/lib/prices";
import { ProductIntro, ProductSpec, SPEC } from "./ProductParts";
import SectionHead from "./SectionHead";
import { PRICING, priceTeaser } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "./Breadcrumbs";
import DesignCard from "./DesignCard";
import JsonLd from "./JsonLd";

const DESCRIPTIONS = {
  tapete: (name) => `${name} je foto tapeta koju štampamo po meri vašeg zida. Izaberite materijal, unesite širinu i visinu i odmah vidite cenu.`,
  "zidni-stikeri": (name) => `${name} je dekorativni zidni stiker koji štampamo u dimenziji po vašem izboru, od 10 do 300 cm.`,
  "slike-na-platnu": (name) => `${name} na slikarskom platnu, kao jednodelna, trodelna ili petodelna slika na drvenom blind ramu.`,
};

export function designMetadata(design) {
  const category = getCategory(design.category);
  const collection = getCollection(design.category, design.collection);
  const href = designHref(design);
  const title = design.category === "slike-na-platnu" ? `${design.name}, slika na platnu` : `${design.name}, ${collection.label.toLowerCase()}`;
  return {
    title,
    description: DESCRIPTIONS[category.slug](design.name),
    alternates: { canonical: href },
    openGraph: { title: `${title} | PLANETATAPETA`, url: href, images: [{ url: design.src, width: design.width, height: design.height }] },
  };
}

/** Accurate offer data only: per-m² unit price or the preset price range. */
function offerFor(category) {
  if (category === "slike-na-platnu") {
    const prices = PRICING[category].layouts.flatMap((l) => l.presets.map((p) => p.price));
    return { "@type": "AggregateOffer", priceCurrency: "RSD", lowPrice: Math.min(...prices), highPrice: Math.max(...prices) };
  }
  const lowest = Math.min(...PRICING[category].materials.map((m) => m.pricePerM2));
  return {
    "@type": "Offer",
    priceCurrency: "RSD",
    price: lowest,
    priceSpecification: { "@type": "UnitPriceSpecification", price: lowest, priceCurrency: "RSD", unitCode: "MTK", unitText: "m²" },
  };
}

export default function DesignPage({ design }) {
  syncPricing();
  const category = getCategory(design.category);
  const collection = getCollection(design.category, design.collection);
  const isCanvas = design.category === "slike-na-platnu";
  const href = designHref(design);

  const siblings = getDesigns(design.category, design.collection);
  const index = siblings.findIndex((d) => d.id === design.id);
  const more = [1, 2, 3, 4].map((offset) => siblings[(index + offset) % siblings.length]).filter((d) => d.id !== design.id);

  const intro = (
    <ProductIntro kicker={isCanvas ? "Slike na platnu" : collection.label} title={design.name} price={priceTeaser(category.slug)} intro={category.intro} />
  );
  const aside = <ProductSpec items={SPEC[category.slug]} />;

  const crumbs = isCanvas
    ? [{ label: category.label, href: `/${category.slug}` }, { label: design.name, href }]
    : [
        { label: category.label, href: `/${category.slug}` },
        { label: collection.label, href: collectionHref(category.slug, collection.slug) },
        { label: design.name, href },
      ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: design.name,
          image: absoluteUrl(design.src),
          description: DESCRIPTIONS[category.slug](design.name),
          category: category.label,
          brand: { "@type": "Brand", name: "PLANETATAPETA" },
          offers: { ...offerFor(category.slug), url: absoluteUrl(href) },
        }}
      />
      <div className="page">
        <Breadcrumbs items={crumbs} />
        <div className="pt-5">
          {isCanvas ? (
            <CanvasConfigurator design={design} href={href} intro={intro} aside={aside} />
          ) : (
            <WallConfigurator category={category.slug} design={design} href={href} intro={intro} aside={aside} />
          )}
        </div>
      </div>

      {more.length ? (
        <section aria-labelledby="jos" className="page mt-[4.5rem] lg:mt-28">
          <SectionHead id="jos" title={isCanvas ? "Još motiva" : `Još iz kolekcije ${collection.label}`}>
            <Link href={isCanvas ? `/${category.slug}` : collectionHref(category.slug, collection.slug)} className="link">
              {isCanvas ? "Svi motivi" : "Cela kolekcija"}
            </Link>
          </SectionHead>
          <ul className="grid grid-cols-2 gap-x-3.5 gap-y-7 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {more.map((d) => (
              <li key={d.id}>
                <DesignCard design={d} meta={isCanvas ? "Slike na platnu" : collection.label} price={priceTeaser(category.slug)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
