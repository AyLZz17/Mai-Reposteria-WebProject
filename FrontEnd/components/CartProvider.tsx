'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const CART_KEY = 'mai-reposteria-cart';

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  position: string;
};

type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function formatPrice(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedCart = localStorage.getItem(CART_KEY);
        if (storedCart) setItems(JSON.parse(storedCart) as CartItem[]);
        setHasLoadedCart(true);
      } catch {
        // The cart remains empty when storage is unavailable or invalid.
        setHasLoadedCart(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;

    if (items.length === 0) {
      localStorage.removeItem(CART_KEY);
      return;
    }

    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [hasLoadedCart, items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem: (product) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.id === product.id);

          if (existingItem) {
            return currentItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }

          return [...currentItems, { ...product, quantity: 1 }];
        });
      },
      decreaseItem: (productId) => {
        setItems((currentItems) =>
          currentItems
            .map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (productId) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
