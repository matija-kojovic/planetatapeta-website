import Breadcrumbs from "@/components/shop/Breadcrumbs";
import Checkout from "@/components/shop/Checkout";
import { getContent } from "@/lib/db";

export const metadata = {
  title: "Porudžbina",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const { contact } = getContent();
  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Korpa", href: "/cart" },
          { label: "Porudžbina", href: "/checkout" },
        ]}
      />
      <Checkout contactEmail={contact.email} />
    </div>
  );
}
