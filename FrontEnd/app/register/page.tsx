"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { loginApi, registerApi } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login, hasAcceptedTerms } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerApi(name, email, password);

      // Redirección si es error de servidor (500)
      if (response.status === 500) {
        router.push("/errores/500");
        return;
      }

      // Redirección si el servicio no está disponible (503)
      if (response.status === 503) {
        router.push("/errores/503");
        return;
      }

      // Error 400 / 4xx (datos inválidos o correo ya registrado)
      if (response.status >= 400 && response.status < 500) {
        setErrorMessage(response.message || "No fue posible registrar la cuenta");
        setIsSubmitting(false);
        return;
      }

      // Respuestas 2xx (éxito): No mostrar código 201 en pantalla.
      // Iniciar sesión y continuar en silencio a términos o inicio
      if (response.status >= 200 && response.status < 300 && response.user) {
        const authenticated = await loginApi(email, password);
        if (authenticated.status !== 200 || !authenticated.user) {
          setErrorMessage("La cuenta fue creada, pero no se pudo iniciar sesión automáticamente");
          setIsSubmitting(false);
          return;
        }
        login(authenticated.user);

        // Si ya aceptó términos va al inicio; como es nuevo, va a términos
        if (hasAcceptedTerms(response.user.id)) {
          router.push("/");
        } else {
          router.push("/terminos");
        }
        return;
      }

      setErrorMessage("Ocurrió un error inesperado al crear tu cuenta");
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
            href="/login"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f5b4b] hover:opacity-70 transition-opacity"
          >
            ← Ya tengo cuenta
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#d8c5b4] bg-[#fdfaf7] p-8 sm:p-10 shadow-[0_12px_26px_rgba(126,86,64,0.15)]">
          <div className="text-center mb-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e3d5] text-2xl mb-4 border border-[#d8c5b4]">
              ✨
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#523326]">
              Crear cuenta
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#7e5b49]">
              Regístrate para guardar tus pedidos y disfrutar lo mejor de Mai Repostería
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-[#d88975] bg-[#faebe7] p-3.5 text-center text-sm font-semibold text-[#8b3527]"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#694d3e] mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full rounded-xl border border-[#d8c5b4] bg-white px-4 py-3 text-sm text-[#523326] placeholder-[#b8a293] focus:border-[#a7725a] focus:outline-none focus:ring-2 focus:ring-[#a7725a]/20 transition-all"
              />
            </div>

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
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-[#d8c5b4] bg-white px-4 py-3 text-sm text-[#523326] placeholder-[#b8a293] focus:border-[#a7725a] focus:outline-none focus:ring-2 focus:ring-[#a7725a]/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-[#694d3e] mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-[#d8c5b4] bg-white px-4 py-3 text-sm text-[#523326] placeholder-[#b8a293] focus:border-[#a7725a] focus:outline-none focus:ring-2 focus:ring-[#a7725a]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-[#a7725a] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#924d3e] active:scale-[0.99] disabled:opacity-60 transition-all"
            >
              {isSubmitting ? "Registrando..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-8 border-t border-[#e4d5c7] pt-5 text-center text-xs text-[#8d6753]">
            <p>
              ¿Ya tienes una cuenta registrada?{" "}
              <Link
                href="/login"
                className="font-bold text-[#a7725a] hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
