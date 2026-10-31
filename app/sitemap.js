import { CATEGORIES, allDesigns, collectionHref, designHref, getCollections } from "@/lib/catalog";
import { getProducts } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export default function sitemap() {
  const entry = (path, priority) => ({ url: absoluteUrl(path), changeFrequency: "monthly", priority });
  return [
    entry("/", 1),
    ...CATEGORIES.map((c) => entry(`/${c.slug}`, 0.9)),
    ...["tapete", "zidni-stikeri"].flatMap((category) => getCollections(category).map((c) => entry(collectionHref(category, c.slug), 0.8))),
    ...allDesigns().map((d) => entry(designHref(d), 0.6)),
    ...getProducts().map((p) => entry(`/product/${p.id}`, 0.6)),
    entry("/contact", 0.5),
  ];
}
