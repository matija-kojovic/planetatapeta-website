import { notFound } from "next/navigation";
import DesignCard from "@/components/shop/DesignCard";
import DesignPage, { designMetadata } from "@/components/shop/DesignPage";
import PageHeader from "@/components/shop/PageHeader";
import RateTable from "@/components/shop/RateTable";
import { collectionCover, collectionHref, findDesign, getCategory, getCollection, getCollections, getDesigns } from "@/lib/catalog";
import { syncPricing } from "@/lib/prices";
import { priceTeaser } from "@/lib/pricing";

// Serves collection pages (/tapete/cvetne) and, because canvas has a single
// collection, canvas design pages (/slike-na-platnu/motiv-03).

// Unknown slugs get notFound() below; see app/(shop)/[category]/page.js for why dynamicParams stays on.

export function generateStaticParams() {
  return [
    ...["tapete", "zidni-stikeri"].flatMap((category) => getCollections(category).map((c) => ({ category, collection: c.slug }))),
    ...getDesigns("slike-na-platnu").map((d) => ({ category: "slike-na-platnu", collection: d.slug })),
  ];
}

function resolve({ category, collection }) {
  if (category === "slike-na-platnu") {
    const design = findDesign(category, "motivi", collection);
    return design ? { design } : null;
  }
  const found = getCollection(category, collection);
  return found ? { collection: found, category: getCategory(category) } : null;
}

export async function generateMetadata({ params }) {
  const match = resolve(await params);
  if (!match) return {};
  if (match.design) return designMetadata(match.design);
  const { category, collection } = match;
  const href = collectionHref(category.slug, collection.slug);
  const cover = collectionCover(category.slug, collection.slug);
  return {
    title: collection.label,
    description: `${collection.description} ${collection.count} dizajna, štampa po meri. ${category.summary}`.trim().slice(0, 160),
    alternates: { canonical: href },
    openGraph: {
      title: `${collection.label} | PLANETATAPETA`,
      url: href,
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : ["/opengraph-image.jpg"],
    },
  };
}

export default async function CollectionPage({ params }) {
  syncPricing();
  const match = resolve(await params);
  if (!match) notFound();
  if (match.design) return <DesignPage design={match.design} />;

  const { category, collection } = match;
  const designs = getDesigns(category.slug, collection.slug);
  return (
    <>
      <PageHeader
        crumbs={[
          { label: category.label, href: `/${category.slug}` },
          { label: collection.label, href: collectionHref(category.slug, collection.slug) },
        ]}
        title={collection.label}
        intro={collection.description}
        aside={<RateTable category={category.slug} />}
        asideClassName="hidden lg:block"
      >
        {/* On small screens the rate table would push the designs below the fold; a one-line price stands in for it. */}
        <p className="t-small tabular mt-4 text-ink-2">
          {designs.length} dizajna<span className="lg:hidden">, cena {priceTeaser(category.slug)}</span>. Izaberite dizajn da biste uneli mere i videli cenu.
        </p>
      </PageHeader>

      <section aria-label="Dizajni" className="page">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {designs.map((design, index) => (
            <li key={design.id}>
              <DesignCard design={design} priority={index < 4} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
