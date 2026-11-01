import PriceList from "@/components/admin/PriceList";
import ProductsManager from "@/components/admin/ProductsManager";
import { CATEGORIES } from "@/lib/catalog";
import { getProducts } from "@/lib/db";

export const metadata = { title: "Proizvodi i cene" };

export default function AdminProductsPage() {
  const categories = CATEGORIES.map(({ slug, label }) => ({ slug, label }));
  return (
    <div className="max-w-5xl">
      <h1 className="t-page">Proizvodi i cene</h1>
      <ProductsManager initialProducts={getProducts()} categories={categories} />
      <PriceList />
    </div>
  );
}
