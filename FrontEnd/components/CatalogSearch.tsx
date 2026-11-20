"use client";

import { useEffect, useRef, useState } from "react";

export default function CatalogSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={isOpen ? "Cerrar búsqueda" : "Buscar productos"}
        aria-expanded={isOpen}
        aria-controls="catalog-search-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#924d3e]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m15.5 15.5 4.2 4.2" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div id="catalog-search-panel" className="absolute right-0 top-full z-50 mt-3 w-[min(88vw,24rem)] rounded-2xl border border-[#d8c5b4] bg-[#fdfaf7] p-4 text-left normal-case tracking-normal shadow-[0_14px_34px_rgba(89,61,45,0.2)]">
          <form action="/shop" method="get" role="search" className="flex gap-2">
            <label className="sr-only" htmlFor="catalog-search-input">Buscar en el catálogo</label>
            <input
              ref={inputRef}
              id="catalog-search-input"
              name="q"
              type="search"
              maxLength={100}
              placeholder="Producto, categoría o ingrediente"
              className="min-w-0 flex-1 rounded-xl border border-[#d8c5b4] bg-white px-3 py-3 text-sm text-[#523b30] outline-none focus:border-[#a7725a] focus:ring-2 focus:ring-[#a7725a]/20"
            />
            <button type="submit" className="rounded-xl bg-[#8c5d46] px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#704834] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#924d3e]">
              Buscar
            </button>
          </form>
          <p className="mt-2 text-xs text-[#806557]">Busca por nombre, categoría, descripción o precio.</p>
        </div>
      )}
    </div>
  );
}
