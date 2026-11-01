import { notFound } from "next/navigation";
import PlexiglassConfigurator from "@/components/configurators/PlexiglassConfigurator";
import StickerPrintConfigurator from "@/components/configurators/StickerPrintConfigurator";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import CollectionChips from "@/components/shop/CollectionChips";
import DesignCard from "@/components/shop/DesignCard";
import FixedProducts from "@/components/shop/FixedProducts";
import JsonLd from "@/components/shop/JsonLd";
import PageHeader from "@/components/shop/PageHeader";
import { ProductIntro, ProductSpec, SPEC } from "@/components/shop/ProductParts";
import RateTable from "@/components/shop/RateTable";
import { CATEGORIES, CATEGORY_COVERS, getCategory, getCollection, getDesign, getDesigns } from "@/lib/catalog";
import { getContent } from "@/lib/db";
import { syncPricing } from "@/lib/prices";
import { priceTeaser } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/site";

// Unknown slugs get notFound() below. Not `dynamicParams = false`: with it, the
// on-demand revalidation after an admin edit fails (NoFallbackError) and turns
// every prerendered page of this route into a 404 until the next deploy.
export const generateStaticParams = () => CATEGORIES.map((c) => ({ category: c.slug }));

const ogImage = (design) => (design ? { url: design.src, width: design.width, height: design.height } : { url: "/opengraph-image.jpg" });

export async function generateMetadata({ params }) {
  const category = getCategory((await params).category);
  if (!category) return {};
  return {
    title: `${category.label} po meri`,
    description: `${category.summary} ${category.intro}`.slice(0, 160),
    alternates: { canonical: `/${category.slug}` },
    // A page-level openGraph replaces the root one, so the image is set here too.
    openGraph: { title: `${category.label} | PLANETATAPETA`, url: `/${category.slug}`, images: [ogImage(getDesign(CATEGORY_COVERS[category.slug]))] },
  };
}

/** Every design in the category (A), each with its collection and starting price. */
function DesignGrid({ designs, meta, price }) {
  return (
    <section aria-label="Dizajni" className="page pt-9">
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-7 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {designs.map((design, index) => (
          <li key={design.id}>
            <DesignCard design={design} meta={meta(design)} price={price} priority={index < 4} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Plexiglass and sticker printing have no designs: the category page is their product page (A). */
function ProductSection({ category, email }) {
  const isPlexi = category.slug === "slike-na-pleksiglasu";
  const intro = <ProductIntro kicker="Štampa po meri" title={category.label} price={priceTeaser(category.slug)} intro={category.intro} />;
  const aside = <ProductSpec items={SPEC[category.slug]} />;
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: category.label, href: `/${category.slug}` }]} />
      <div className="pt-5">
        {isPlexi ? <PlexiglassConfigurator email={email} intro={intro} aside={aside} /> : <StickerPrintConfigurator email={email} intro={intro} aside={aside} />}
      </div>
    </div>
  );
}

export default async function CategoryPage({ params }) {
  syncPricing();
  const category = getCategory((await params).category);
  if (!category) notFound();
  const { contact } = getContent();

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
      {category.hasDesigns ? (
        <>
          <PageHeader
            crumbs={[{ label: category.label, href: `/${category.slug}` }]}
            title={category.label}
            intro={category.intro}
            aside={<RateTable category={category.slug} />}
            asideClassName="hidden lg:block"
          >
            {/* On phones the price list would push the designs down; one line stands in for it. */}
            <p className="tabular mt-4 text-[0.875rem] text-ink-2 lg:hidden">Cena {priceTeaser(category.slug)}.</p>
          </PageHeader>
          {category.slug === "slike-na-platnu" ? null : <CollectionChips category={category.slug} />}
          <DesignGrid
            designs={getDesigns(category.slug)}
            meta={(d) => (category.slug === "slike-na-platnu" ? "Slike na platnu" : getCollection(category.slug, d.collection)?.label)}
            price={priceTeaser(category.slug)}
          />
        </>
      ) : (
        <ProductSection category={category} email={contact.email} />
      )}

      <FixedProducts category={category.slug} />
    </>
  );
}
