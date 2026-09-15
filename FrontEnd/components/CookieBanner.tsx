'use client';

import { useEffect, useState } from 'react';

const COOKIE_KEY = 'mai-reposteria-cookie-consent';
const OPEN_SETTINGS_EVENT = 'mai:open-cookie-settings';

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

type OptionalPreferences = Pick<CookieConsent, 'analytics' | 'marketing'>;

const defaultPreferences: OptionalPreferences = {
  analytics: false,
  marketing: false,
};

function readConsent(): CookieConsent | null {
  try {
    const storedConsent = localStorage.getItem(COOKIE_KEY);
    return storedConsent ? (JSON.parse(storedConsent) as CookieConsent) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const storedConsent = readConsent();
    const bannerTimer = window.setTimeout(() => setShowBanner(!storedConsent), 0);

    const openSettings = () => {
      const savedConsent = readConsent();
      setPreferences(savedConsent ?? defaultPreferences);
      setShowBanner(true);
      setShowSettings(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => {
      window.clearTimeout(bannerTimer);
      window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const saveConsent = (optionalPreferences: OptionalPreferences) => {
    const consent: CookieConsent = {
      necessary: true,
      ...optionalPreferences,
      acceptedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
    } catch {
      // The banner can still be dismissed when storage is unavailable.
    }

    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Preferencias de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)] px-4 py-4 shadow-[0_-12px_28px_rgba(109,76,58,0.18)]"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-[#7f5b4b]">
              Cookies y privacidad
            </p>
            <h2 className="mt-1 text-[1.6rem] italic text-[#6d4c3a]">Tu experiencia importa</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d4c3a]/85">
              Usamos cookies necesarias para el funcionamiento del sitio y opcionales para mejorar tu experiencia. Puedes cambiar tu elección en cualquier momento.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowSettings((isOpen) => !isOpen)}
              aria-expanded={showSettings}
              className="rounded-full border border-[#b38d6a] bg-transparent px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#6d4c3a] transition hover:-translate-y-0.5 hover:bg-[#f0e3d5]"
            >
              Configurar
            </button>
            <button
              type="button"
              onClick={() => saveConsent(defaultPreferences)}
              className="rounded-full border border-[#b38d6a] bg-[#f8f2eb] px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#6d4c3a] transition hover:-translate-y-0.5 hover:bg-[#f0e3d5]"
            >
              Rechazar opcionales
            </button>
            <button
              type="button"
              onClick={() => saveConsent({ analytics: true, marketing: true })}
              className="rounded-full border border-[#b38d6a] bg-[#c48e67] px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#fffaf5] shadow-[0_10px_20px_rgba(196,142,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#b67f58]"
            >
              Aceptar todas
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-5 grid gap-4 border-t border-[#d8c5b4] pt-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#d8c5b4] bg-[#f8f2eb] p-4">
              <p className="font-semibold text-[#6d4c3a]">Necesarias</p>
              <p className="mt-1 text-sm leading-5 text-[#6d4c3a]/80">Permiten el funcionamiento básico del sitio.</p>
              <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-[#7f5b4b]">Siempre activas</span>
            </div>

            {([
              ['analytics', 'Analíticas', 'Nos ayudan a entender cómo se usa la página.'],
              ['marketing', 'Marketing', 'Permiten mostrar contenido y campañas relevantes.'],
            ] as const).map(([key, label, description]) => (
              <label key={key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#d8c5b4] bg-[#f8f2eb] p-4">
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))}
                  className="mt-1 h-4 w-4 accent-[#a7725a]"
                />
                <span>
                  <span className="block font-semibold text-[#6d4c3a]">{label}</span>
                  <span className="mt-1 block text-sm leading-5 text-[#6d4c3a]/80">{description}</span>
                </span>
              </label>
            ))}

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={() => saveConsent(preferences)}
                className="rounded-full bg-[#6d4c3a] px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#fffaf5] transition hover:bg-[#593b2d]"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
