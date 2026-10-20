"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, hasAcceptedTerms } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionExpired =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("expired") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await loginApi(email, password);

      // Reglas RF-04:
      // 500 -> redirigir a /errores/500
      if (response.status === 500) {
        router.push("/errores/500");
        return;
      }

      // 503 o Sin conexión -> redirigir a /errores/503
      if (response.status === 503) {
        router.push("/errores/503");
        return;
      }

      // 400 / 401 -> "Credenciales inválidas" en la misma página (sin mostrar número de código)
      if (response.status === 400 || response.status === 401) {
        setErrorMessage("Credenciales inválidas");
        setIsSubmitting(false);
        return;
      }

      // 2xx (éxito) -> no mostrar código ni mensaje de estado. Guardar sesión y continuar en silencio
      if (response.status >= 200 && response.status < 300 && response.user) {
        login(response.user);

        // Si ya aceptó términos previamente va al inicio, si no va a términos (RF-02)
        if (hasAcceptedTerms(response.user.id)) {
          router.push("/");
        } else {
          router.push("/terminos");
        }
        return;
      }

      // Cualquier otro error imprevisto
      setErrorMessage("Credenciales inválidas");
      setIsSubmitting(false);
    } catch {
      router.push("/errores/503");
    }
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
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f5b4b] hover:opacity-70 transition-opacity"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#d8c5b4] bg-[#fdfaf7] p-8 sm:p-10 shadow-[0_12px_26px_rgba(126,86,64,0.15)]">
          <div className="text-center mb-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e3d5] text-2xl mb-4 border border-[#d8c5b4]">
              👤
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#523326]">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#7e5b49]">
              Ingresa a tu cuenta para continuar con tus pedidos en Mai Repostería
            </p>
          </div>

          {(errorMessage || sessionExpired) && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-[#d88975] bg-[#faebe7] p-3.5 text-center text-sm font-semibold text-[#8b3527] animate-shake"
            >
              {errorMessage || "Tu sesión expiró. Inicia sesión nuevamente."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#694d3e] mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@mai.com"
                className="w-full rounded-xl border border-[#d8c5b4] bg-white px-4 py-3 text-sm text-[#523326] placeholder-[#b8a293] focus:border-[#a7725a] focus:outline-none focus:ring-2 focus:ring-[#a7725a]/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#694d3e] mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#d8c5b4] bg-white px-4 py-3 text-sm text-[#523326] placeholder-[#b8a293] focus:border-[#a7725a] focus:outline-none focus:ring-2 focus:ring-[#a7725a]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#a7725a] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#924d3e] active:scale-[0.99] disabled:opacity-60 transition-all"
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#8d6753]">
            <p>
              ¿No tienes una cuenta aún?{" "}
              <Link
                href="/register"
                className="font-bold text-[#a7725a] hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
