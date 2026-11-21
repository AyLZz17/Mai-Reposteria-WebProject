'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { addCartItem, deleteCartItem, getCart, updateCartItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export type CartProduct = { id: string; name: string; price: number; image: string; position: string };
export type CartItem = CartProduct & { quantity: number };
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  loadError: string;
  feedback: string;
  feedbackType: 'success' | 'error' | '';
  mutating: boolean;
  refreshCart: () => Promise<void>;
  clearFeedback: () => void;
  addItem: (product: CartProduct) => Promise<boolean>;
  decreaseItem: (productId: string) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

function mapItems(items: any[] = [], fallback?: CartProduct): CartItem[] {
  return items.map((item) => {
    const matchingFallback = fallback?.id === item.productId ? fallback : undefined;
    return {
      id: item.productId,
      name: item.name,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      image: item.image || matchingFallback?.image || '/images/products/galletas-chocolate.svg',
      position: item.position || matchingFallback?.position || '50% 50%',
    };
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [mutating, setMutating] = useState(false);
  const mutationLock = useRef(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoadError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const cart = await getCart();
      setItems(mapItems(cart.items));
    } catch {
      setLoadError('No pudimos cargar tu carrito. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setItems([]);
      setLoadError('');
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setLoadError('');
    getCart()
      .then((cart) => { if (active) setItems(mapItems(cart.items)); })
      .catch(() => { if (active) setLoadError('No pudimos cargar tu carrito. Revisa tu conexión e inténtalo de nuevo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const clearFeedback = useCallback(() => {
    setFeedback('');
    setFeedbackType('');
  }, []);

  const runMutation = useCallback(async (request: () => Promise<any>, successMessage: string, fallback?: CartProduct) => {
    if (!user) {
      setFeedback('Inicia sesión para guardar productos en tu carrito.');
      setFeedbackType('error');
      return false;
    }
    if (mutationLock.current) return false;

    mutationLock.current = true;
    setMutating(true);
    clearFeedback();
    try {
      const cart = await request();
      setItems(mapItems(cart.items, fallback));
      setFeedback(successMessage);
      setFeedbackType('success');
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No pudimos actualizar tu carrito. Inténtalo de nuevo.');
      setFeedbackType('error');
      return false;
    } finally {
      mutationLock.current = false;
      setMutating(false);
    }
  }, [clearFeedback, user]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    loading,
    loadError,
    feedback,
    feedbackType,
    mutating,
    refreshCart,
    clearFeedback,
    addItem: (product) => runMutation(
      () => addCartItem(product),
      `${product.name} se agregó a tu carrito.`,
      product,
    ),
    decreaseItem: (productId) => {
      const item = items.find((entry) => entry.id === productId);
      if (!item) return Promise.resolve(false);
      const request = item.quantity === 1
        ? () => deleteCartItem(productId)
        : () => updateCartItem(productId, item.quantity - 1);
      return runMutation(request, item.quantity === 1 ? `${item.name} se quitó del carrito.` : `Cantidad de ${item.name} actualizada.`);
    },
    removeItem: (productId) => {
      const item = items.find((entry) => entry.id === productId);
      return runMutation(
        () => deleteCartItem(productId),
        item ? `${item.name} se quitó del carrito.` : 'Producto eliminado del carrito.',
      );
    },
  }), [items, loading, loadError, feedback, feedbackType, mutating, refreshCart, clearFeedback, runMutation]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
}
