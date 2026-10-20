"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function TerminosConsentPage() {
  const router = useRouter();
  const { user, acceptTermsForUser, hasAcceptedTerms, logout } = useAuth();

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si el usuario ya aceptó antes, redirigir directo al inicio (RF-02)
    if (user && hasAcceptedTerms(user.id)) {
      router.replace("/");
    }
  }, [user, hasAcceptedTerms, router]);

  const canContinue = acceptTerms && acceptPrivacy;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue || !user) return;

    setIsSubmitting(true);
    // Guardar la aceptación (por usuario) y llevar al inicio
    acceptTermsForUser(user.id);
    router.replace("/");
  };

  const handleCancel = () => {
    // Si no acepta, no se completa el acceso (no queda logueado)
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e] flex flex-col justify-between">
      <header className="border-b border-[#d8c5b4] bg-[linear-gradient(135deg,#f5efe7_0%,#f0e3d5_48%,#e0c7ac_100%)]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-6">
          <Link href="/" className="leading-none text-[#6d4c3a] transition-opacity hover:opacity-70">
            <span className="block text-[2.2rem] tracking-[-0.06em] lg:text-[3.2rem] font-serif">MAI</span>
            <span className="mt-0.5 block text-[0.7rem] uppercase tracking-[0.28em] lg:text-[0.85rem]">
              REPOSTERIA
            </span>
          </Link>
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#924d3e] hover:opacity-70 transition-opacity"
          >
            Cancelar y salir
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-[#d8c5b4] bg-[#fdfaf7] p-8 sm:p-10 shadow-[0_12px_26px_rgba(126,86,64,0.15)]">
          <div className="text-center mb-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e3d5] text-2xl mb-4 border border-[#d8c5b4]">
              📜
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#523326]">
              Términos y Privacidad
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#7e5b49]">
              {user ? `Hola ${user.name}, antes` : "Antes"} de continuar, debes revisar y aceptar nuestras políticas obligatorias.
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-[#e4d5c7] bg-white p-5">
              {/* Casilla 1: Términos y condiciones */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="chk-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-[#c7a988] text-[#a7725a] focus:ring-[#a7725a] cursor-pointer"
                />
                <span className="text-sm text-[#694d3e] leading-snug">
                  He leído y acepto los{" "}
                  <Link
                    href="/terminos-y-condiciones"
                    target="_blank"
                    className="font-bold text-[#a7725a] hover:underline"
                  >
                    Términos y Condiciones
                  </Link>{" "}
                  de Mai Repostería.
                </span>
              </label>

              {/* Casilla 2: Política de privacidad */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="chk-privacy"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-[#c7a988] text-[#a7725a] focus:ring-[#a7725a] cursor-pointer"
                />
                <span className="text-sm text-[#694d3e] leading-snug">
                  He leído y acepto la{" "}
                  <Link
                    href="/politica-de-privacidad"
                    target="_blank"
                    className="font-bold text-[#a7725a] hover:underline"
                  >
                    Política de Privacidad
                  </Link>{" "}
                  y el tratamiento de mis datos personales.
                </span>
              </label>
            </div>

            <p className="text-xs text-[#8d6753] text-center">
              Ambas casillas son obligatorias para completar tu acceso y realizar pedidos.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-1/2 rounded-xl border border-[#d8c5b4] bg-white py-3 text-sm font-semibold text-[#694d3e] hover:bg-[#f0e3d5] transition-colors"
              >
                Rechazar y salir
              </button>

              <button
                type="submit"
                id="btn-continue"
                disabled={!canContinue || isSubmitting}
                className="w-full sm:w-1/2 rounded-xl bg-[#a7725a] py-3 text-sm font-bold text-white shadow-md hover:bg-[#924d3e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
