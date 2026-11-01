import PriceEditor from "@/components/admin/PriceEditor";
import PriceList from "@/components/admin/PriceList";
import ProductsManager from "@/components/admin/ProductsManager";
import { CATEGORIES } from "@/lib/catalog";
import { getProducts } from "@/lib/db";
import { syncPricing } from "@/lib/prices";
import { PRICE_FIELDS, currentPrice, defaultPrice } from "@/lib/pricing";

export const metadata = { title: "Proizvodi i cene" };

export default function AdminProductsPage() {
  syncPricing();
  const categories = CATEGORIES.map(({ slug, label }) => ({ slug, label }));
  const fields = PRICE_FIELDS.map(({ key, group, label, unit, decimals, ...f }) => ({
    key,
    group,
    label,
    unit,
    decimals,
    value: currentPrice(f),
    defaultValue: defaultPrice(f),
  }));
  return (
    <div className="max-w-5xl">
      <h1 className="t-page">Proizvodi i cene</h1>
      <ProductsManager initialProducts={getProducts()} categories={categories} />
      <PriceEditor fields={fields} />
      <PriceList />
    </div>
  );
}
