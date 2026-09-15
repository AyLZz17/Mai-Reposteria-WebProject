'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, useCart } from '../../components/CartProvider';

export default function CartPage() {
  const { items, itemCount, subtotal, addItem, decreaseItem, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e]">
      <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-6">
          <Link href="/" className="leading-none text-[#6d4c3a] transition-opacity hover:opacity-70">
            <span className="block text-[2.6rem] tracking-[-0.06em] lg:text-[4rem]">MAI</span>
            <span className="mt-1 block text-[0.75rem] uppercase tracking-[0.28em] lg:text-[1rem]">
              REPOSTERIA
            </span>
          </Link>
          <Link
            href="/shop"
            className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#7f5b4b] transition-opacity hover:opacity-70"
          >
            Seguir comprando
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-8 lg:py-16">
        <div className="mb-10 border-b border-[#d7c3af] pb-6">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a7725a]">Tu selección</p>
          <h1 className="mt-2 text-[3rem] italic leading-none text-[#6d4c3a] lg:text-[4.8rem]">Tu carrito</h1>
          {items.length > 0 && (
            <p className="mt-4 text-sm text-[#7f5b4b]">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} seleccionados
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-[#d7c3af] bg-[#f9f5f0] px-6 py-16 text-center shadow-[0_18px_34px_rgba(136,97,69,0.08)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a486] bg-[#efe0d2] text-3xl text-[#9a674c]">
              ♡
            </div>
            <h2 className="mt-7 text-[2rem] italic text-[#6d4c3a]">Tu carrito está vacío</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#7f5b4b]">
              Explora nuestra selección de productos artesanales y agrega tus favoritos aquí.
            </p>
            <Link
              href="/shop"
              className="mt-8 rounded-xl border border-[#b6926d] bg-[#c48e67] px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#fffaf5] shadow-[0_8px_18px_rgba(181,149,120,0.25)] transition hover:-translate-y-0.5 hover:bg-[#b67f58]"
            >
              Explorar productos
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <section className="space-y-4" aria-label="Productos en el carrito">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 rounded-[1.5rem] border border-[#d7c3af] bg-[#f9f5f0] p-4 shadow-[0_12px_24px_rgba(136,97,69,0.08)] sm:gap-6 sm:p-5"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1rem] bg-[#efe2d4] sm:h-36 sm:w-36">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 112px, 144px"
                      className="object-cover"
                      style={{ objectPosition: item.position }}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[1.35rem] italic leading-tight text-[#6d4c3a] sm:text-[1.65rem]">{item.name}</h2>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#a7725a]">Repostería artesanal</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Eliminar ${item.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-[#a7725a] transition hover:bg-[#efe0d2] hover:text-[#6d4c3a]"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-center rounded-full border border-[#c9a486] bg-[#f3e7dc]">
                        <button
                          type="button"
                          onClick={() => decreaseItem(item.id)}
                          aria-label={`Reducir cantidad de ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center text-lg text-[#6d4c3a] transition hover:bg-[#ead7c2]"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm text-[#6d4c3a]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => addItem(item)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center text-lg text-[#6d4c3a] transition hover:bg-[#ead7c2]"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[1.3rem] italic text-[#6d4c3a]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[1.5rem] border border-[#d7c3af] bg-[#f1e3d7] p-6 shadow-[0_18px_34px_rgba(136,97,69,0.1)] lg:sticky lg:top-6">
              <p className="text-[0.75rem] uppercase tracking-[0.24em] text-[#a7725a]">Resumen</p>
              <h2 className="mt-2 text-[2rem] italic text-[#6d4c3a]">Tu compra</h2>

              <div className="mt-7 space-y-4 border-b border-[#c9a486] pb-5 text-sm text-[#7f5b4b]">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span className="text-[#6d4c3a]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Envío</span>
                  <span className="text-right text-xs">Calculado al finalizar</span>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-4">
                <span className="text-lg uppercase tracking-[0.12em] text-[#6d4c3a]">Total</span>
                <span className="text-[2rem] italic text-[#6d4c3a]">{formatPrice(subtotal)}</span>
              </div>

              <button
                type="button"
                className="mt-7 w-full rounded-xl border border-[#b6926d] bg-[#c48e67] px-4 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#fffaf5] shadow-[0_8px_18px_rgba(181,149,120,0.25)] transition hover:-translate-y-0.5 hover:bg-[#b67f58]"
              >
                Continuar con el pago
              </button>
              <Link
                href="/shop"
                className="mt-4 block text-center text-xs uppercase tracking-[0.16em] text-[#7f5b4b] underline decoration-[#c9a486] underline-offset-4 transition hover:text-[#6d4c3a]"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
