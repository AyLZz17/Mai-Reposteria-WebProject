"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserNav from "../../components/UserNav";
import { getStorefront, StorefrontSettings } from "../../lib/api";

const defaultAbout = "En Mai Repostería preparamos postres artesanales con dedicación, para compartir momentos especiales con quienes más quieres.";

export default function AboutPage() {
  const [aboutText, setAboutText] = useState(defaultAbout);

  useEffect(() => {
    void getStorefront()
      .then(({ settings }: { settings: StorefrontSettings }) => setAboutText(settings.about_text ?? defaultAbout))
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e]">
      <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-sm text-[#6d4c3a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">
            <Image src="/images/brand/logo.svg" alt="" width={56} height={56} className="h-14 w-14 rounded-full border-4 border-[#d8c5b4] bg-[#f1e8df] object-cover" />
            <span className="text-lg font-medium tracking-[0.1em] sm:text-xl">MAI REPOSTERIA</span>
          </Link>
          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] sm:text-sm">
            <Link href="/" className="rounded-sm py-2 hover:text-[#a7725a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Home</Link>
            <Link href="/about" aria-current="page" className="rounded-sm py-2 font-bold text-[#924d3e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">About</Link>
            <Link href="/shop" className="rounded-sm py-2 hover:text-[#a7725a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Shop</Link>
            <Link href="/contact" className="rounded-sm py-2 hover:text-[#a7725a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Contact</Link>
            <UserNav />
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-10 sm:py-16">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-[#806557]">
          <Link href="/" className="underline decoration-[#b88f71] underline-offset-4 hover:text-[#5e3c2d]">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">About</span>
        </nav>

        <section aria-labelledby="about-title" className="mx-auto grid w-full max-w-5xl gap-6 rounded-[1.75rem] border border-[#decbbb] bg-[#f8f2eb] px-6 py-9 shadow-[0_16px_40px_rgba(136,97,69,0.1)] sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-10 sm:px-12 sm:py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7725a]">Nuestra esencia</p>
            <h1 id="about-title" className="mt-2 text-4xl font-medium italic text-[#6d4c3a] sm:text-5xl">About Mai</h1>
          </div>
          <p className="whitespace-pre-line text-base leading-8 text-[#684b3d] sm:text-lg">{aboutText}</p>
        </section>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#8c5d46] px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#fffaf5] shadow-md transition hover:-translate-y-0.5 hover:bg-[#704834] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Conoce nuestros productos</Link>
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b88f71] px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#704834] transition hover:bg-[#f8f2eb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
