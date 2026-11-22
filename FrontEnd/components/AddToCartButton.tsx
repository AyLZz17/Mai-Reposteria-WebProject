'use client';

import { useEffect, useState } from 'react';
import { useCart, type CartProduct } from './CartProvider';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type AddToCartButtonProps = {
  product: CartProduct;
  className: string;
  label?: string;
};

export default function AddToCartButton({ product, className, label = 'ADD TO CART' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdded) return;

    const timer = window.setTimeout(() => setIsAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [isAdded]);

  const handleAdd = async () => {
    setError('');
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setIsAdding(true);
    const added = await addItem(product);
    setIsAdding(false);
    setIsAdded(added);
    if (!added) setError('No pudimos agregar este producto. Inténtalo de nuevo.');
  };

  return (
    <div className="relative mt-6">
      {isAdded && <span role="status" className="cart-toast-in absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#c9a486] bg-[#fffaf5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d4c3a] shadow-[0_8px_18px_rgba(136,97,69,0.16)]">Añadido al carrito</span>}
      {error && <span role="alert" className="mb-2 block text-center text-xs font-semibold text-[#8b3527]">{error}</span>}
      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding || isLoading}
        aria-busy={isAdding}
        className={`${className} ${isAdded ? 'cart-add-pop bg-[#b67f58]' : ''} disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]`}
      >
        {isAdding ? 'AGREGANDO…' : isAdded ? 'AÑADIDO' : label}
      </button>
    </div>
  );
}
