'use client';

import { useEffect, useState } from 'react';
import { useCart, type CartProduct } from './CartProvider';

type AddToCartButtonProps = {
  product: CartProduct;
  className: string;
};

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) return;

    const timer = window.setTimeout(() => setIsAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [isAdded]);

  const handleAdd = () => {
    addItem(product);
    setIsAdded(true);
  };

  return (
    <div className="relative mt-6">
      {isAdded && (
        <span
          role="status"
          className="cart-toast-in absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#c9a486] bg-[#fffaf5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d4c3a] shadow-[0_8px_18px_rgba(136,97,69,0.16)]"
        >
          Añadido al carrito
        </span>
      )}
      <button
        type="button"
        onClick={handleAdd}
        className={`${className} ${isAdded ? 'cart-add-pop bg-[#b67f58]' : ''}`}
      >
        {isAdded ? 'AÑADIDO' : 'ADD TO CART'}
      </button>
    </div>
  );
}
