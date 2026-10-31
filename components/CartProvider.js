"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
  isMounted: false
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("printshop_cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("printshop_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (product) => {
    setItems(current => {
      const matchKey = product.configurationKey || product.paperType;
      const existing = current.find(item => 
        item.id === product.id && (item.configurationKey || item.paperType) === matchKey
      );
      if (existing) {
        return current.map(item => 
          item.id === product.id && (item.configurationKey || item.paperType) === matchKey
            ? { ...item, quantity: item.quantity + product.quantity } 
            : item
        );
      }
      return [...current, product];
    });
  };

  const removeFromCart = (id, key) => {
    setItems(current => current.filter(item => 
      !(item.id === id && (item.configurationKey || item.paperType) === key)
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartTotal, cartCount, isMounted }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
