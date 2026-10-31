"use client";

import TapeteForm from "./product-forms/TapeteForm";
import StikeriForm from "./product-forms/StikeriForm";
import NalepniceForm from "./product-forms/NalepniceForm";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";

export default function ProductConfigurator({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (item) => {
    // Ensure we parse the structure for the Cart
    // Cart Provider expects: id, price, quantity, (and paperType for uniqueness)
    const cartItem = {
      ...item,
      // Map finalPrice to what CartProvider expects
      price: item.finalPrice || item.price,
      // Default quantity if not provided by form
      quantity: item.configuration?.quantity || 1, 
      // Use configuration as a uniqueness key similar to how paperType was used
      configurationKey: JSON.stringify(item.configuration)
    };

    addToCart(cartItem);
    router.push("/cart");
  };

  switch (product.itemId) {
    case "tapete":
      return <TapeteForm product={product} onAddToCart={handleAddToCart} />;
    case "zidni_stikeri":
      return <StikeriForm product={product} onAddToCart={handleAddToCart} categoryType="stikeri" />;
    case "slike_na_platnu":
    case "slike_na_pleksiglasu":
      return <StikeriForm product={product} onAddToCart={handleAddToCart} categoryType="platno" />;
    case "izrada_nalepnica":
      return <NalepniceForm product={product} onAddToCart={handleAddToCart} />;
    default:
      // Fallback form for simple products like t-shirts, mugs, etc.
      return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-lg mx-auto text-white text-center">
             <div className="text-6xl mb-4">{product.image}</div>
             <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
             <p className="text-2xl text-cyan-400 font-extrabold mb-8">{product.price.toLocaleString('sr-RS')} RSD</p>
             <button 
                onClick={() => handleAddToCart({ ...product, finalPrice: product.price })}
                className="w-full bg-[#2b7bc0] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Dodaj u korpu
             </button>
        </div>
      );
  }
}
