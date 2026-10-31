import Checkout from "@/components/shop/Checkout";
import { getContent } from "@/lib/db";

export const metadata = {
  title: "Porudžbina",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const { contact } = getContent();
  return (
    <div className="page pb-8 pt-8 lg:pt-12">
      <h1 className="t-page mb-8 lg:mb-12">Podaci za dostavu</h1>
      <Checkout contactEmail={contact.email} />
    </div>
  );
}
