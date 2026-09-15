'use client';

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../components/CartProvider";

function BrandLogo() {
  return (
    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[10px] border-[#a7725a] shadow-[0_12px_26px_rgba(126,86,64,0.25)]">
      <Image
        src="/images/brand/logo.svg"
        alt="Logo Mai Reposteria"
        width={160}
        height={160}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

const products = [
  {
    name: "Caja de Alfajores",
    price: "$15.000",
    image: "/images/products/alfajores.svg",
    colors: ["#d9c4b8", "#b76d55", "#d4ae7b"],
    position: "50% 32%",
  },
  {
    name: "Galletas de Chocolate Blanco",
    price: "$4.000",
    image: "/images/products/galletas-blanco.svg",
    colors: ["#ceb49e", "#d8b58d", "#8d5a3b"],
    position: "50% 58%",
  },
  {
    name: "Galletas de Chocolate",
    price: "$4.500",
    image: "/images/products/galletas-chocolate.svg",
    colors: ["#d9b461", "#a85a31", "#6b3f2a"],
    position: "50% 52%",
  },
  {
    name: "Pink Shirt",
    price: "$5.000",
    image: "/images/products/pink-shirt.svg",
    colors: ["#d3a87a", "#ad6b4f", "#924d3e"],
    position: "50% 50%",
  },
];

export default function Home() {
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

        <main className="mx-auto max-w-[1500px] px-6 pb-16">
          <section className="relative mt-8 overflow-hidden border-y border-[#d8c5b4] bg-[#d9bcae]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15)), url('/images/banner/Diseño%20sin%20título.svg')", backgroundSize: 'cover', backgroundPosition: 'center top' }}>
            <div className="absolute inset-0 bg-[#d9bcae]/70" />

            <div className="relative flex flex-col items-center justify-center gap-6 py-10 lg:py-16">
              <div className="flex items-center justify-center">
                <BrandLogo />
              </div>

              <h2 className="text-center text-[2.5rem] leading-none italic text-[#f5eee7] drop-shadow-[0_4px_12px_rgba(104,72,53,0.26)] lg:text-[5.5rem]">
                New Product
              </h2>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.name}
                className="group flex min-h-full flex-col rounded-[1.75rem] border border-[#d7c3af] bg-[#f5efe6] p-4 shadow-[0_18px_34px_rgba(136,97,69,0.12)]"
              >
                <div className="overflow-hidden rounded-[1.5rem] bg-[#efe2d4]">
                  <div className="h-[320px] w-full overflow-hidden">
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
                    <h3 className="text-[1.9rem] italic text-[#6d4c3a]">{product.name}</h3>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="h-5 w-5 rounded-full border border-[#b88f71]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="mt-4 text-[1.7rem] italic text-[#6d4c3a]">{product.price}</div>
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
                    onClick={() => window.dispatchEvent(new Event('mai:open-cookie-settings'))}
                    className="self-start text-left underline decoration-[#e4c7af]/70 underline-offset-4 transition hover:text-[#e4c7af] md:self-auto"
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
