'use client';

import Link from 'next/link';
import { openCookieSettings } from '../../components/CookieBanner';
import { useCart } from '../../components/CartProvider';

type Product = {
  name: string;
  price: string;
  image: string;
  colors: string[];
  position: string;
};

type Category = {
  name: string;
  products: Product[];
};

const categories: Category[] = [
  {
    name: 'Galletas',
    products: [
      {
        name: 'Galletas Clásicas',
        price: '$4.000',
        image: '/images/products/galletas-blanco.svg',
        colors: ['#d9b787', '#a36a4f', '#e7d0af'],
        position: '50% 56%',
      },
      {
        name: 'Galletas de Chocolate',
        price: '$4.500',
        image: '/images/products/galletas-chocolate.svg',
        colors: ['#d9b461', '#a85a31', '#6b3f2a'],
        position: '50% 52%',
      },
      {
        name: 'Galletas de Mantequilla',
        price: '$5.000',
        image: '/images/products/galletas-blanco.svg',
        colors: ['#f0dfc4', '#d4a77d', '#b97757'],
        position: '50% 50%',
      },
    ],
  },
  {
    name: 'Tortas',
    products: [
      {
        name: 'Torta de Fresa',
        price: '$30.000',
        image: '/images/products/galletas-chocolate.svg',
        colors: ['#f0d1d3', '#d79096', '#8f4d5d'],
        position: '50% 48%',
      },
      {
        name: 'Torta de Vainilla',
        price: '$28.000',
        image: '/images/products/alfajores.svg',
        colors: ['#f4e4c5', '#d7a96f', '#b67848'],
        position: '50% 38%',
      },
      {
        name: 'Torta de Chocolate',
        price: '$32.000',
        image: '/images/products/pink-shirt.svg',
        colors: ['#c79973', '#7d4e3e', '#3f2a24'],
        position: '50% 56%',
      },
    ],
  },
  {
    name: 'Cupcakes',
    products: [
      {
        name: 'Cupcakes Clásicos',
        price: '$8.000',
        image: '/images/products/alfajores.svg',
        colors: ['#f0d3db', '#eac4a0', '#d58d6c'],
        position: '50% 36%',
      },
      {
        name: 'Cupcakes de Fresa',
        price: '$9.000',
        image: '/images/products/galletas-blanco.svg',
        colors: ['#f5d3dc', '#d7788f', '#a95d75'],
        position: '50% 52%',
      },
      {
        name: 'Cupcakes de Vainilla',
        price: '$8.500',
        image: '/images/products/galletas-chocolate.svg',
        colors: ['#f6e7cb', '#d6a66f', '#9f6948'],
        position: '50% 48%',
      },
    ],
  },
  {
    name: 'Combos',
    products: [
      {
        name: 'Combo Familiar',
        price: '$45.000',
        image: '/images/products/alfajores.svg',
        colors: ['#f0d0d7', '#dcae7c', '#7a5444'],
        position: '50% 40%',
      },
      {
        name: 'Combo para Celebrar',
        price: '$58.000',
        image: '/images/products/galletas-blanco.svg',
        colors: ['#dbb1a8', '#bb7e68', '#6b3e38'],
        position: '50% 52%',
      },
      {
        name: 'Combo Premium',
        price: '$70.000',
        image: '/images/products/pink-shirt.svg',
        colors: ['#ebd7c5', '#c99870', '#865d46'],
        position: '50% 50%',
      },
    ],
  },
];

export default function ShopPage() {
  const { addItem, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e]">
      <div className="mx-auto max-w-[1600px]">
        <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
          <div className="mx-auto max-w-[1500px] px-6 py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="leading-none text-[#6d4c3a]">
                <div className="text-[2.8rem] font-normal tracking-[-0.06em] lg:text-[5rem]">
                  MAI
                </div>
                <div className="mt-1 text-[0.85rem] uppercase tracking-[0.28em] lg:text-[1.1rem]">
                  REPOSTERIA
                </div>
              </div>

              <nav className="flex flex-wrap items-center justify-center gap-6 text-[0.9rem] uppercase tracking-[0.22em] text-[#6d4c3a] lg:gap-10 lg:text-[1.1rem]">
                {[
                  { label: 'HOME', href: '/' },
                  { label: 'ABOUT', href: '#' },
                  { label: 'SHOP', href: '/shop' },
                  { label: 'CONTACT', href: '#' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="transition-opacity hover:opacity-70"
                  >
                    {item.label}
                  </a>
                ))}

                <div className="flex items-center gap-3 pl-2">
                  <button
                    type="button"
                    aria-label="Buscar"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-xl text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)]"
                  >
                    ⌕
                  </button>
                  <button
                    type="button"
                    aria-label="Perfil"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-xl text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)]"
                  >
                    👤
                  </button>
                  <Link
                    href="/cart"
                    aria-label="Carrito"
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-xl text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)]"
                  >
                    🛒
                    {itemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a7725a] px-1 text-[0.65rem] font-bold text-[#fffaf5]">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-6 py-10">
          <section className="mb-8 flex items-center justify-between gap-4 border-b border-[#d7c3af] pb-4">
            <div>
              <p className="text-[0.8rem] uppercase tracking-[0.28em] text-[#7f5b4b]">
                Catálogo
              </p>
              <h1 className="mt-2 text-[2.5rem] italic text-[#6d4c3a] lg:text-[4rem]">
                Shop
              </h1>
            </div>
            <Link
              href="/"
              className="text-[0.8rem] uppercase tracking-[0.22em] text-[#7f5b4b] transition-opacity hover:opacity-70"
            >
              Volver al inicio
            </Link>
          </section>

          <section className="space-y-6">
            {categories.map((category) => (
              <details
                key={category.name}
                className="overflow-hidden rounded-[1.75rem] border border-[#d7c3af] bg-[#f5efe6] shadow-[0_18px_34px_rgba(136,97,69,0.12)]"
              >
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 bg-[#f1e3d7] px-5 py-4 text-left transition hover:bg-[#ead7c2]">
                  <div>
                    <p className="text-[0.75rem] uppercase tracking-[0.24em] text-[#7f5b4b]">
                      Categoría
                    </p>
                    <h2 className="mt-1 text-[1.8rem] italic text-[#6d4c3a]">
                      {category.name}
                    </h2>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b38d6a] bg-[#f8f2eb] text-2xl text-[#6d4c3a]">
                    +
                  </span>
                </summary>

                <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {category.products.map((product) => (
                    <article
                      key={product.name}
                      className="group flex min-h-full flex-col rounded-[1.5rem] border border-[#d7c3af] bg-[#f9f5f0] p-4 shadow-[0_10px_22px_rgba(136,97,69,0.08)]"
                    >
                      <div className="overflow-hidden rounded-[1.25rem] bg-[#efe2d4]">
                        <div className="h-[260px] w-full overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ objectPosition: product.position }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-1 flex-col justify-between text-center">
                        <div>
                          <h3 className="text-[1.6rem] italic text-[#6d4c3a]">{product.name}</h3>

                          <div className="mt-4 flex items-center justify-center gap-3">
                            {product.colors.map((color) => (
                              <span
                                key={color}
                                className="h-5 w-5 rounded-full border border-[#b88f71]"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>

                          <div className="mt-4 text-[1.5rem] italic text-[#6d4c3a]">
                            {product.price}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              id: product.name,
                              name: product.name,
                              price: Number(product.price.replace(/\D/g, '')),
                              image: product.image,
                              position: product.position,
                            })
                          }
                          className="mt-6 w-full rounded-xl border border-[#b6926d] bg-[#d9bcae] px-4 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.24em] text-[#fefaf4] shadow-[0_8px_18px_rgba(181,149,120,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#cba487]"
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </section>
        </main>

        <footer className="mt-8 border-t border-[#c7a988] bg-[#1e1d1d] text-[#f5efe7]">
          <div className="mx-auto max-w-[1500px] px-6 py-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#f3e7dc] text-2xl text-[#5f4134]">
                  M
                </div>
                <div>
                  <div className="text-[1.1rem] font-semibold uppercase tracking-[0.2em] text-[#f5efe7]">
                    Mai Reposteria
                  </div>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-3 xl:grid-cols-6">
                {[
                  'MENÚ',
                  'PEDIDOS PERSONALIZADOS',
                  'PAGOS',
                  'ENVÍOS',
                  'RESEÑAS',
                  'CONTACTO',
                  'POLÍTICA DE PRIVACIDAD',
                  'TÉRMINOS Y CONDICIONES',
                  'AYUDA',
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-[#f5efe7]/90 transition-colors hover:text-[#e4c7af]"
                  >
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[#f5efe7]">
                <a href="#" aria-label="X" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#2b2a2a] text-lg">
                  X
                </a>
                <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#2b2a2a] text-lg">
                  ◌
                </a>
                <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#2b2a2a] text-lg">
                  f
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-[#c7a988]/70 pt-6 text-sm text-[#f5efe7]/80">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="text-left transition-colors hover:text-[#e4c7af]"
                  >
                    Preferencias de cookies
                  </button>
                  <span>© 2026 Mai Reposteria, Inc. Todos los derechos reservados.</span>
                </div>

                <a href="#" className="flex items-center gap-2 self-start text-[#f5efe7] md:self-auto">
                  <span>IR AL INICIO</span>
                  <span className="text-lg">↑</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
