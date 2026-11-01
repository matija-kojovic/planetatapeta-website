import Breadcrumbs from "@/components/shop/Breadcrumbs";
import CartView from "@/components/shop/CartView";

export const metadata = {
  title: "Korpa",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: "Korpa", href: "/cart" }]} />
      <h1 className="t-section mb-8 mt-3">Korpa</h1>
      <CartView />
    </div>
  );
}
