'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, useCart } from '../../components/CartProvider';
import OrderCheckout from '../../components/OrderCheckout';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    loading,
    loadError,
    feedback,
    feedbackType,
    mutating,
    refreshCart,
    clearFeedback,
    addItem,
    decreaseItem,
    removeItem,
  } = useCart();

  const showLoading = authLoading || loading;

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e]">
      <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
          <Link href="/" aria-label="Mai Repostería, inicio" className="leading-none text-[#6d4c3a] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e593f]">
            <span className="block text-[2.4rem] tracking-[-0.06em] lg:text-[4rem]">MAI</span>
            <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.28em] lg:text-[1rem]">REPOSTERIA</span>
          </Link>
          <Link
            href="/shop"
            className="rounded-full px-3 py-2 text-right text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#7f5b4b] transition hover:bg-white/50 hover:text-[#5f4134] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e593f] sm:px-4 sm:text-[0.75rem] sm:tracking-[0.2em]"
          >
            Seguir comprando
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5 sm:py-10 lg:px-8 lg:py-16">
        <div className="mb-7 border-b border-[#d7c3af] pb-5 sm:mb-10 sm:pb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-[#a7725a]">Tu selección</p>
          <h1 className="mt-2 text-[2.7rem] italic leading-none text-[#6d4c3a] sm:text-[3rem] lg:text-[4.8rem]">Tu carrito</h1>
          {!showLoading && user && items.length > 0 && (
            <p className="mt-4 text-sm text-[#7f5b4b]" aria-live="polite">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu selección
            </p>
          )}
        </div>

        {feedback && (
          <div
            role={feedbackType === 'error' ? 'alert' : 'status'}
            className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${feedbackType === 'error' ? 'border-[#d88975] bg-[#faebe7] text-[#8b3527]' : 'border-[#bdd0b9] bg-[#edf5eb] text-[#426748]'}`}
          >
            <span>{feedback}</span>
            <button type="button" onClick={clearFeedback} aria-label="Cerrar mensaje" className="rounded px-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e593f]">×</button>
          </div>
        )}

        {showLoading ? (
          <section aria-label="Cargando carrito" aria-busy="true" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              {[1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-[1.5rem] border border-[#d7c3af] bg-[#f9f5f0]" />)}
              <p className="sr-only" role="status">Cargando los productos de tu carrito</p>
            </div>
            <div className="h-72 animate-pulse rounded-[1.5rem] border border-[#d7c3af] bg-[#f1e3d7]" />
          </section>
        ) : loadError ? (
          <section role="alert" className="rounded-[1.5rem] border border-[#d88975] bg-[#fff8f5] p-7 text-center shadow-[0_12px_24px_rgba(136,97,69,0.08)] sm:p-10">
            <h2 className="text-2xl italic text-[#6d4c3a]">No pudimos mostrar tu selección</h2>
            <p className="mt-3 text-sm leading-6 text-[#7f5b4b]">{loadError}</p>
            <button
              type="button"
              onClick={() => void refreshCart()}
              className="mt-6 rounded-xl border border-[#b6926d] bg-[#c48e67] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fffaf5] transition hover:bg-[#b67f58] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]"
            >
              Reintentar
            </button>
          </section>
        ) : !user ? (
          <section className="flex min-h-[350px] flex-col items-center justify-center rounded-[1.75rem] border border-[#d7c3af] bg-[#f9f5f0] px-6 py-14 text-center shadow-[0_18px_34px_rgba(136,97,69,0.08)]">
            <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a486] bg-[#efe0d2] text-3xl text-[#9a674c]">♡</div>
            <h2 className="mt-7 text-[1.8rem] italic text-[#6d4c3a] sm:text-[2rem]">Inicia sesión para ver tu carrito</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#7f5b4b]">Tu selección queda guardada en tu cuenta para que puedas continuar después.</p>
            <Link href="/login" className="mt-7 rounded-xl border border-[#b6926d] bg-[#c48e67] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fffaf5] shadow-[0_8px_18px_rgba(181,149,120,0.25)] transition hover:-translate-y-0.5 hover:bg-[#b67f58] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]">
              Iniciar sesión
            </Link>
            <Link href="/shop" className="mt-5 text-xs uppercase tracking-[0.16em] text-[#7f5b4b] underline decoration-[#c9a486] underline-offset-4">Explorar productos</Link>
          </section>
        ) : items.length === 0 ? (
          <section className="flex min-h-[380px] flex-col items-center justify-center rounded-[1.75rem] border border-[#d7c3af] bg-[#f9f5f0] px-6 py-14 text-center shadow-[0_18px_34px_rgba(136,97,69,0.08)]">
            <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a486] bg-[#efe0d2] text-3xl text-[#9a674c]">♡</div>
            <h2 className="mt-7 text-[2rem] italic text-[#6d4c3a]">Tu carrito está vacío</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#7f5b4b]">Explora nuestra selección de productos artesanales y guarda aquí tus favoritos.</p>
            <Link href="/shop" className="mt-8 rounded-xl border border-[#b6926d] bg-[#c48e67] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fffaf5] shadow-[0_8px_18px_rgba(181,149,120,0.25)] transition hover:-translate-y-0.5 hover:bg-[#b67f58] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]">
              Explorar productos
            </Link>
          </section>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
            <section className="space-y-4" aria-label="Productos en el carrito" aria-busy={mutating}>
              {items.map((item) => (
                <article key={item.id} className="flex gap-3 rounded-[1.5rem] border border-[#d7c3af] bg-[#f9f5f0] p-3 shadow-[0_12px_24px_rgba(136,97,69,0.08)] sm:gap-6 sm:p-5">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] bg-[#efe2d4] sm:h-36 sm:w-36">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 96px, 144px" className="object-cover" style={{ objectPosition: item.position }} />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="break-words text-[1.15rem] italic leading-tight text-[#6d4c3a] sm:text-[1.65rem]">{item.name}</h2>
                        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-[#a7725a] sm:text-xs sm:tracking-[0.16em]">Repostería artesanal</p>
                        <p className="mt-2 text-xs text-[#7f5b4b]">{formatPrice(item.price)} c/u</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        disabled={mutating}
                        aria-label={`Eliminar ${item.name} del carrito`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-[#a7725a] transition hover:bg-[#efe0d2] hover:text-[#6d4c3a] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e593f]"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-[#c9a486] bg-[#f3e7dc]" aria-label={`Cantidad de ${item.name}`}>
                        <button type="button" onClick={() => void decreaseItem(item.id)} disabled={mutating} aria-label={`Reducir cantidad de ${item.name}`} className="flex h-9 w-9 items-center justify-center text-lg text-[#6d4c3a] transition hover:bg-[#ead7c2] disabled:cursor-wait disabled:opacity-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#8e593f]">−</button>
                        <span className="min-w-9 text-center text-sm tabular-nums text-[#6d4c3a]" aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => void addItem(item)} disabled={mutating} aria-label={`Aumentar cantidad de ${item.name}`} className="flex h-9 w-9 items-center justify-center text-lg text-[#6d4c3a] transition hover:bg-[#ead7c2] disabled:cursor-wait disabled:opacity-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#8e593f]">+</button>
                      </div>
                      <p className="text-lg italic tabular-nums text-[#6d4c3a] sm:text-[1.3rem]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[1.5rem] border border-[#d7c3af] bg-[#f1e3d7] p-5 shadow-[0_18px_34px_rgba(136,97,69,0.1)] sm:p-6 lg:sticky lg:top-6">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#a7725a]">Resumen del pedido</p>
              <h2 className="mt-2 text-[1.8rem] italic text-[#6d4c3a]">Tu compra</h2>

              <div className="mt-6 space-y-4 border-b border-[#c9a486] pb-5 text-sm text-[#7f5b4b]">
                <div className="flex justify-between gap-4">
                  <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                  <span className="text-right text-[#6d4c3a]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Envío</span>
                  <span className="max-w-40 text-right text-xs leading-5">Se confirma al coordinar la entrega</span>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-4">
                <span className="text-base uppercase tracking-[0.12em] text-[#6d4c3a]">Subtotal</span>
                <span className="text-[1.8rem] italic tabular-nums text-[#6d4c3a]">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#7f5b4b]">El costo de envío se confirmará según tu ubicación.</p>

              <button type="button" onClick={() => setCheckoutOpen(true)} disabled={mutating} className="mt-6 w-full rounded-xl border border-[#b6926d] bg-[#c48e67] px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#fffaf5] transition hover:bg-[#b67f58] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]" aria-describedby="checkout-status">
                Continuar con el pedido
              </button>
              <p id="checkout-status" className="mt-3 text-center text-xs leading-5 text-[#7f5b4b]">Confirma tus datos y envía el ticket a la vendedora por WhatsApp.</p>
              <Link href="/shop" className="mt-4 block rounded-lg py-2 text-center text-xs uppercase tracking-[0.16em] text-[#7f5b4b] underline decoration-[#c9a486] underline-offset-4 transition hover:text-[#6d4c3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e593f]">
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </main>
      <OrderCheckout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
