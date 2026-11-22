'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStorefront, type StorefrontSettings } from '../lib/api';

const footerLinks = [
  { label: 'MENÚ', href: '/shop' },
  { label: 'PEDIDOS PERSONALIZADOS', href: '/contact?tema=pedidos-personalizados' },
  { label: 'SEGUIR MI PEDIDO', href: '/pedido' },
  { label: 'PAGOS', href: '/terminos-y-condiciones#payments' },
  { label: 'ENVÍOS', href: '/terminos-y-condiciones#shipping' },
  { label: 'RESEÑAS', href: '/contact?tema=resenas' },
  { label: 'CONTACTO', href: '/contact' },
  { label: 'POLÍTICA DE PRIVACIDAD', href: '/politica-de-privacidad' },
  { label: 'TÉRMINOS Y CONDICIONES', href: '/terminos-y-condiciones' },
  { label: 'AYUDA', href: '/contact?tema=ayuda' },
];

const socialLinks = [
  { label: 'X', key: 'footer_x_url' as const, mark: 'X' },
  { label: 'Instagram', key: 'footer_instagram_url' as const, mark: '◎' },
  { label: 'Facebook', key: 'footer_facebook_url' as const, mark: 'f' },
];

export default function StoreFooter({ settings, loadSettings = true }: { settings?: StorefrontSettings; loadSettings?: boolean }) {
  const [loadedSettings, setLoadedSettings] = useState<StorefrontSettings | null>(null);

  useEffect(() => {
    if (settings || !loadSettings) return;
    let active = true;
    getStorefront().then(({ settings: loaded }) => {
      if (active) setLoadedSettings(loaded);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [loadSettings, settings]);

  const storefrontSettings = settings || loadedSettings;

  return (
    <footer className="mt-8 border-t border-[#c7a988] bg-[#1e1d1d] text-[#f5efe7]">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/" aria-label="Mai Repostería, inicio" className="flex items-center gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4c7af]">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#f3e7dc] text-2xl text-[#5f4134]">M</span>
            <span className="text-[1.1rem] font-semibold uppercase tracking-[0.2em]">Mai Repostería</span>
          </Link>

          <nav aria-label="Enlaces del pie de página" className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-3 xl:grid-cols-6">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-sm text-[#f5efe7]/90 transition-colors hover:text-[#e4c7af] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4c7af]">
                {item.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Redes sociales" className="flex items-center gap-4 text-[#f5efe7]">
            {socialLinks.map(({ label, key, mark }) => {
              const href = storefrontSettings?.[key]?.trim();
              return href ? (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Visitar ${label}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b4] bg-[#2b2a2a] text-lg transition-colors hover:bg-[#51413a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4c7af]">
                  {mark}
                </a>
              ) : null;
            })}
          </nav>
        </div>

        <div className="mt-8 border-t border-[#c7a988]/70 pt-6 text-sm text-[#f5efe7]/80">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <button type="button" onClick={() => window.dispatchEvent(new Event('mai:open-cookie-settings'))} className="self-start rounded-sm text-left underline decoration-[#e4c7af]/70 underline-offset-4 transition hover:text-[#e4c7af] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4c7af] md:self-auto">
                Preferencias de cookies
              </button>
              <span>© 2026 Mai Repostería. Todos los derechos reservados.</span>
            </div>
            <Link href="/#top" className="flex items-center gap-2 self-start rounded-sm text-[#f5efe7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4c7af] md:self-auto">
              <span>IR AL INICIO</span><span aria-hidden="true" className="text-lg">↑</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
