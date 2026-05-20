"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ColorOption } from "../data/products";

export interface CartItem {
  product: Product;
  selectedColor: ColorOption;
  selectedStorage: string;
  quantity: number;
  price: number; // Adjusted price based on storage upgrades
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: ColorOption, storage: string) => void;
  removeFromCart: (name: string, color: string, storage: string) => void;
  updateQuantity: (name: string, color: string, storage: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function getStoragePriceModifier(baseStorage: string[], selectedStorage: string): number {
  if (selectedStorage === "N/A" || !baseStorage.includes(selectedStorage)) return 0;
  const selIdx = baseStorage.indexOf(selectedStorage);
  if (selIdx <= 0) return 0;
  
  // Custom price increments matching Apple standard upgrades
  const increments = [0, 100, 200, 400, 800, 1200];
  return increments[selIdx] || selIdx * 200;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCart = localStorage.getItem("shopy_cart");
        if (storedCart) {
          return JSON.parse(storedCart);
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("shopy_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product: Product, color: ColorOption, storage: string) => {
    const modifier = getStoragePriceModifier(product.specs.storage_capacities, storage);
    const itemPrice = product.specs.starting_price + modifier;

    setCart((prev) => {
      // Check if exact same product variant is already in cart
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.name === product.name &&
          item.selectedColor.color === color.color &&
          item.selectedStorage === storage
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            selectedColor: color,
            selectedStorage: storage,
            quantity: 1,
            price: itemPrice,
          },
        ];
      }
    });

    // Automatically trigger cart drawer opening for feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (name: string, color: string, storage: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.name === name &&
            item.selectedColor.color === color &&
            item.selectedStorage === storage
          )
      )
    );
  };

  const updateQuantity = (name: string, color: string, storage: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(name, color, storage);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.name === name &&
        item.selectedColor.color === color &&
        item.selectedStorage === storage
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
