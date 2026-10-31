"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CART_QUANTITY, calculatePrice, configurationKey, validateOptions } from "@/lib/pricing";

// The cart stores what the customer chose, never prices. Prices are derived
// from lib/pricing.js on every render (and recalculated by the server at
// checkout), so a stale or edited localStorage value cannot change a price.

const STORAGE_KEY = "planetatapeta-cart-v1";
const LEGACY_KEY = "printshop_cart";
export const FIXED_PRODUCT = "proizvod";

const CartContext = createContext(null);

function readStoredCart() {
  try {
    localStorage.removeItem(LEGACY_KEY); // old format carried client-side prices
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.key === "string") : [];
  } catch {
    return [];
  }
}

/** Unit price of a cart line, or null when its configuration is no longer valid. */
export function linePrice(item) {
  if (item.category === FIXED_PRODUCT) return Number.isInteger(item.displayPrice) ? item.displayPrice : null;
  const { ok, options } = validateOptions(item.category, item.options);
  return ok ? calculatePrice(item.category, options).total : null;
}

const clampQuantity = (n) => Math.min(CART_QUANTITY.max, Math.max(CART_QUANTITY.min, Math.round(n) || 1));

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
    const onStorage = (event) => event.key === STORAGE_KEY && setItems(readStoredCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked: the cart still works for this visit.
    }
  }, [items, ready]);

  /** entry: { category, designId?, productId?, options, name, image, href, displayPrice? } */
  const addItem = useCallback((entry, quantity = 1) => {
    const key = configurationKey(entry.category, entry.designId || entry.productId, entry.options || {});
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item));
      }
      return [...current, { ...entry, key, quantity: clampQuantity(quantity) }];
    });
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item)));
  }, []);

  const removeItem = useCallback((key) => setItems((current) => current.filter((item) => item.key !== key)), []);
  const restoreItem = useCallback((item, index) => {
    setItems((current) => (current.some((i) => i.key === item.key) ? current : [...current.slice(0, index), item, ...current.slice(index)]));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (linePrice(item) || 0) * item.quantity, 0);
    return { items, ready, count, total, addItem, setQuantity, removeItem, restoreItem, clear };
  }, [items, ready, addItem, setQuantity, removeItem, restoreItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
