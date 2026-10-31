import { CartProvider } from "@/components/CartProvider";
import { getContent } from "@/lib/db";
import Footer from "./Footer";
import Header from "./Header";

/** Storefront frame shared by the (shop) layout and the 404 page. */
export default function SiteChrome({ children }) {
  const { header, contact } = getContent();
  return (
    <CartProvider>
      <a href="#main" className="skip-link">
        Preskoči na sadržaj
      </a>
      <Header announcement={header.announcement} phone={contact.phone} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer contact={contact} />
    </CartProvider>
  );
}
