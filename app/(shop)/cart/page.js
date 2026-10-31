import CartView from "@/components/shop/CartView";

export const metadata = {
  title: "Korpa",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="page pb-8 pt-8 lg:pt-12">
      <h1 className="t-page mb-8 lg:mb-12">Korpa</h1>
      <CartView />
    </div>
  );
}
