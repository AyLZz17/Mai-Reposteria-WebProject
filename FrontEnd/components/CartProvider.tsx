'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { addCartItem, deleteCartItem, getCart, updateCartItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export type CartProduct = { id: string; name: string; price: number; image: string; position: string };
type CartItem = CartProduct & { quantity: number };
type CartContextValue = { items: CartItem[]; itemCount: number; subtotal: number; loading: boolean; addItem: (product: CartProduct) => void; decreaseItem: (productId: string) => void; removeItem: (productId: string) => void };
const CartContext = createContext<CartContextValue | null>(null);
export function formatPrice(value: number) { return `$${value.toLocaleString('es-CO')}`; }
function mapItems(items: any[], fallback?: CartProduct): CartItem[] { return (items || []).map((item) => ({ id: item.productId, name: item.name, price: Number(item.unitPrice), quantity: item.quantity, image: fallback?.image || '/images/products/galletas-chocolate.svg', position: fallback?.position || '50% 50%' })); }

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const [items, setItems] = useState<CartItem[]>([]); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!user) { setItems([]); return; } setLoading(true); getCart(user.id).then((cart) => setItems(mapItems(cart.items))).catch(() => setItems([])).finally(() => setLoading(false)); }, [user]);
  const value = useMemo<CartContextValue>(() => ({
    items, itemCount: items.reduce((n, item) => n + item.quantity, 0), subtotal: items.reduce((n, item) => n + item.price * item.quantity, 0), loading,
    addItem: (product) => { if (!user) return; addCartItem(user.id, product).then((cart) => setItems(mapItems(cart.items, product))).catch(() => undefined); },
    decreaseItem: (productId) => { if (!user) return; const item = items.find((entry) => entry.id === productId); if (!item) return; const action = item.quantity === 1 ? deleteCartItem(user.id, productId) : updateCartItem(user.id, productId, item.quantity - 1); action.then((cart) => setItems(mapItems(cart.items, item))).catch(() => undefined); },
    removeItem: (productId) => { if (!user) return; const item = items.find((entry) => entry.id === productId); deleteCartItem(user.id, productId).then((cart) => setItems(mapItems(cart.items, item))).catch(() => undefined); },
  }), [items, loading, user]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart must be used inside a CartProvider'); return context; }
