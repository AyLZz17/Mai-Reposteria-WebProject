'use client';

import Image from "next/image";
import * as React from "react";
import Link from "next/link";
import AddToCartButton from "../components/AddToCartButton";
import { useCart } from "../components/CartProvider";
import UserNav from "../components/UserNav";
import { useAuth } from "../context/AuthContext";
import { CatalogProduct, getStorefront, StorefrontSettings } from "../lib/api";

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

const fallbackProducts = [
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
  const { itemCount } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role === "ADMIN" || role === "SUPER_ADMIN");
  const [storefront, setStorefront] = React.useState<{ settings: StorefrontSettings; products: CatalogProduct[] } | null>(null);
  React.useEffect(() => { void getStorefront().then(setStorefront).catch(() => undefined); }, []);
  const settings = storefront?.settings;
  const products = storefront?.products?.length ? storefront.products : fallbackProducts;

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e]">
      <div className="mx-auto max-w-[1600px]">
        <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
          <div className="mx-auto max-w-[1500px] px-6 py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 leading-none text-[#6d4c3a]">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#d8c5b4] bg-[#f1e8df] shadow-[0_12px_26px_rgba(126,86,64,0.18)] lg:h-24 lg:w-24">
                  <Image
                    src="/images/brand/logo.svg"
                    alt="Logo Mai Reposteria"
                    width={120}
                    height={120}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[1.25rem] font-medium tracking-[0.1em] sm:text-[1.8rem] lg:text-[2.5rem]">
                  MAI REPOSTERIA
                </div>
              </div>

              <nav aria-label="Navegación principal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[0.78rem] uppercase tracking-[0.16em] text-[#6d4c3a] sm:text-[0.9rem] lg:gap-8 lg:text-[1rem]">
                {[
                  { label: 'HOME', href: '/' },
                  { label: 'ABOUT', href: '#about' },
                  { label: 'SHOP', href: '/shop' },
                  { label: 'CONTACT', href: '#' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-sm py-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]"
                  >
                    {item.label}
                  </a>
                ))}
                {isAdmin && <Link href="/admin" className="font-bold text-[#924d3e] transition-opacity hover:opacity-70">ADMIN</Link>}

                <div className="flex items-center gap-3 pl-2">
                  <button
                    type="button"
                    aria-label="Buscar"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-xl text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)]"
                  >
                    ⌕
                  </button>
                  <UserNav />
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
          <section aria-labelledby="hero-title" className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-[#d8c5b4] bg-[#d9bcae] shadow-[0_20px_48px_rgba(104,72,53,0.12)] sm:mt-8" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15)), url('${settings?.hero_background_url || "/images/banner/Diseño%20sin%20título.svg"}')`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
            <div className="absolute inset-0 bg-[#d9bcae]/70" />

            <div className="relative flex flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:gap-6 lg:py-16">
              <div className="flex items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[7px] border-[#a7725a] shadow-[0_12px_26px_rgba(126,86,64,0.25)] sm:h-36 sm:w-36 sm:border-[9px]"><img src={settings?.hero_logo_url || "/images/brand/logo.svg"} alt="Logo Mai Reposteria" className="h-full w-full object-cover" /></div>
              </div>

              <h1 id="hero-title" className="max-w-4xl text-[2.4rem] font-medium leading-tight italic drop-shadow-[0_4px_12px_rgba(104,72,53,0.26)] sm:text-5xl lg:text-7xl" style={{ color: settings?.hero_title_color || "#f5eee7" }}>
                {settings?.hero_title || "New Product"}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-[#51382d] sm:text-base">Hecho con cariño para acompañar tus momentos especiales.</p>
              <Link href="/shop" className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full border border-[#8c5d46] bg-[#8c5d46] px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#fffaf5] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#704834] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fffaf5]">Explorar productos</Link>
            </div>
          </section>

          <section id="about" aria-labelledby="about-title" className="mx-auto mt-12 grid max-w-5xl gap-4 rounded-[1.5rem] border border-[#decbbb] bg-[#f8f2eb] px-6 py-8 shadow-[0_12px_30px_rgba(136,97,69,0.08)] sm:mt-16 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-10 sm:px-10 sm:py-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7725a]">Nuestra esencia</p>
              <h2 id="about-title" className="mt-2 text-3xl font-medium italic text-[#6d4c3a] sm:text-4xl">About Mai</h2>
            </div>
            <p className="whitespace-pre-line text-base leading-7 text-[#684b3d]">{settings?.about_text ?? "En Mai Repostería preparamos postres artesanales con dedicación, para compartir momentos especiales con quienes más quieres."}</p>
          </section>

          <section id="productos-destacados" aria-labelledby="products-title" className="mt-12 sm:mt-16">
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7725a]">Una selección para ti</p>
                <h2 id="products-title" className="mt-2 text-3xl font-medium italic text-[#6d4c3a] sm:text-4xl">Favoritos de la casa</h2>
              </div>
              <Link href="/shop" className="w-fit rounded-sm text-sm font-semibold text-[#80543f] underline decoration-[#b88f71] underline-offset-4 hover:text-[#5e3c2d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Ver todo el menú <span aria-hidden="true">→</span></Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {products.map((product: any) => (
              <article
                key={product.name}
                className="group flex min-h-full flex-col rounded-[1.5rem] border border-[#d7c3af] bg-[#f9f5ef] p-3 shadow-[0_12px_30px_rgba(136,97,69,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(136,97,69,0.16)] sm:p-4"
              >
                <div className="overflow-hidden rounded-[1.5rem] bg-[#efe2d4]">
                  <div className="h-64 w-full overflow-hidden sm:h-72 xl:h-60 2xl:h-72">
                    <img
                      src={product.main_image_url || product.image || "/images/products/galletas-chocolate.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: product.image_position || ("position" in product ? product.position : "50% 50%") }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-between text-center">
                  <div>
                    <h3 className="min-h-14 text-xl leading-7 italic text-[#6d4c3a] sm:text-2xl">{product.name}</h3>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      {(product.display_colors || ("colors" in product ? product.colors : [])).map((color: string) => (
                        <span
                          key={color}
                          className="h-5 w-5 rounded-full border border-[#b88f71]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="mt-4 text-[1.7rem] italic text-[#6d4c3a]">{typeof product.price === "number" ? `$${product.price.toLocaleString("es-CO")}` : product.price}</div>
                  </div>

                  <AddToCartButton
                    product={{
                      id: product.name,
                      name: product.name,
                      price: Number(String(product.price).replace(/\D/g, '')),
                      image: "main_image_url" in product ? product.main_image_url || "" : product.image,
                      position: "image_position" in product ? product.image_position : product.position,
                    }}
                    className="w-full rounded-xl border border-[#b6926d] bg-[#d9bcae] px-4 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.24em] text-[#fefaf4] shadow-[0_8px_18px_rgba(181,149,120,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#cba487]"
                    label={settings?.card_button_label || "ADD TO CART"}
                  />
                </div>
              </article>
            ))}
            </div>
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
                  { label: 'MENÚ', href: '/shop' },
                  { label: 'PEDIDOS PERSONALIZADOS', href: '#' },
                  { label: 'PAGOS', href: '#' },
                  { label: 'ENVÍOS', href: '#' },
                  { label: 'RESEÑAS', href: '#' },
                  { label: 'CONTACTO', href: '#' },
                  { label: 'POLÍTICA DE PRIVACIDAD', href: '/politica-de-privacidad' },
                  { label: 'TÉRMINOS Y CONDICIONES', href: '/terminos-y-condiciones' },
                  { label: 'AYUDA', href: '#' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[#f5efe7]/90 transition-colors hover:text-[#e4c7af]"
                  >
                    {item.label}
                  </Link>
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
                  <span>© 2026 Mai Reposteria. Todos los derechos reservados.</span>
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
