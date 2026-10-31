import { notFound } from "next/navigation";
import DesignPage, { designMetadata } from "@/components/shop/DesignPage";
import { allDesigns, findDesign } from "@/lib/catalog";

export const dynamicParams = false;

export const generateStaticParams = () =>
  allDesigns()
    .filter((d) => d.category !== "slike-na-platnu")
    .map((d) => ({ category: d.category, collection: d.collection, design: d.slug }));

export async function generateMetadata({ params }) {
  const { category, collection, design } = await params;
  const found = findDesign(category, collection, design);
  return found ? designMetadata(found) : {};
}

export default async function Page({ params }) {
  const { category, collection, design } = await params;
  const found = findDesign(category, collection, design);
  if (!found) notFound();
  return <DesignPage design={found} />;
}
