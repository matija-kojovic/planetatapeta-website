import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import FixedProductActions from "@/components/shop/FixedProductActions";
import PageHeader from "@/components/shop/PageHeader";
import { designHref, findDesignBySrc, getCategory, legacyProductHref } from "@/lib/catalog";
import { getProduct } from "@/lib/db";
import { formatRSD } from "@/lib/format";

// /product/{id} serves fixed-price products from the admin, and permanently
// redirects the original site's product URLs to their new pages:
//   /product/tapeta-3, /product/platno-1, ...      (retired seed products)
//   /product/tapeta?img=/tapete/3d/3Dtapete1.webp   (old configurator links)

const LEGACY_CONFIGURATORS = { tapeta: "/tapete", stiker: "/zidni-stikeri", "slika-na-platnu": "/slike-na-platnu" };

export async function generateMetadata({ params }) {
  const product = getProduct((await params).productId);
  if (!product) return { robots: { index: false } };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) || `${product.title}, ${formatRSD(product.price)}.`,
    alternates: { canonical: `/product/${product.id}` },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const { productId } = await params;

  if (LEGACY_CONFIGURATORS[productId]) {
    const img = (await searchParams).img;
    const design = typeof img === "string" ? findDesignBySrc(img) : null;
    permanentRedirect(design ? designHref(design) : LEGACY_CONFIGURATORS[productId]);
  }

  const product = getProduct(productId);
  if (!product) {
    const legacy = legacyProductHref(productId);
    if (legacy) permanentRedirect(legacy);
    notFound();
  }

  const category = getCategory(product.category);
  return (
    <>
      <PageHeader
        size="section"
        crumbs={[
          ...(category ? [{ label: category.label, href: `/${category.slug}` }] : []),
          { label: product.title, href: `/product/${product.id}` },
        ]}
        title={product.title}
      />
      <div className="page grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="board !aspect-[5/4] lg:col-span-7">
          {product.image ? <Image src={product.image} alt={product.title} width={1000} height={800} unoptimized priority /> : null}
        </div>
        <div className="grid content-start gap-6 lg:col-span-5">
          {product.description ? <p className="t-lead measure text-ink-2">{product.description}</p> : null}
          <p className="tabular font-display text-[2rem]">{formatRSD(product.price)}</p>
          <FixedProductActions product={{ id: product.id, title: product.title, price: product.price, image: product.image }} />
        </div>
      </div>
    </>
  );
}
