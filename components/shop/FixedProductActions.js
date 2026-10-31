"use client";

import { FIXED_PRODUCT, useCart } from "@/components/CartProvider";
import { AddToCartBar } from "@/components/configurators/fields";

export default function FixedProductActions({ product }) {
  const { addItem } = useCart();
  return (
    <AddToCartBar
      price={{ total: product.price, lines: [] }}
      onAdd={() => {
        addItem({
          category: FIXED_PRODUCT,
          productId: product.id,
          options: {},
          name: product.title,
          image: product.image || "",
          href: `/product/${product.id}`,
          displayPrice: product.price,
        });
        return true;
      }}
    />
  );
}
