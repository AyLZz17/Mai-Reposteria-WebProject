"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import UserNav from "../../components/UserNav";

export default function ContactPage({ contactEmail }: { contactEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const canOpenWhatsApp = name.trim().length >= 2 && message.trim().length >= 3;
  const canOpenEmail = Boolean(contactEmail);
  const mailtoUrl = useMemo(() => {
    const subject = "Mensaje desde MAI Reposteria";
    const body = `Nombre: ${name.trim()}\nCorreo: ${email.trim()}\n\nMensaje:\n${message.trim()}`;
    return `mailto:${contactEmail}?${new URLSearchParams({ subject, body })}`;
  }, [contactEmail, email, message, name]);
  const whatsappUrl = useMemo(() => {
    const lines = [`Hola, soy ${name.trim()}.`, message.trim()];
    if (email.trim()) lines.push(`Mi correo es ${email.trim()}.`);
    return `https://wa.me/573195583957?${new URLSearchParams({ text: lines.join("\n\n") })}`;
  }, [email, message, name]);

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactEmail) return;
    setEmailNotice("Se abrió tu aplicación de correo con el mensaje preparado. Revísalo y pulsa Enviar para completar el envío.");
    window.location.href = mailtoUrl;
  }

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
            <Link href="/about" className="rounded-sm py-2 hover:text-[#a7725a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">About</Link>
            <Link href="/shop" className="rounded-sm py-2 hover:text-[#a7725a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Shop</Link>
            <Link href="/contact" aria-current="page" className="rounded-sm py-2 font-bold text-[#924d3e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#924d3e]">Contact</Link>
            <UserNav />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 py-10 sm:py-14">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-[#806557]">
          <Link href="/" className="underline decoration-[#b88f71] underline-offset-4 hover:text-[#5e3c2d]">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">Contact</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7725a]">Estamos para ayudarte</p>
          <h1 className="mt-2 text-4xl font-medium italic text-[#6d4c3a] sm:text-5xl">Hablemos</h1>
          <p className="mt-3 leading-7 text-[#806557]">Cuéntanos qué necesitas. Preparamos un correo para que lo envíes desde tu aplicación, o puedes continuar la conversación por WhatsApp.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
          <section aria-labelledby="email-contact-title" className="rounded-[1.5rem] border border-[#decbbb] bg-[#f8f2eb] p-6 shadow-[0_14px_34px_rgba(136,97,69,0.09)] sm:p-8">
            <h2 id="email-contact-title" className="text-2xl font-medium italic text-[#6d4c3a]">Escríbenos por correo</h2>
            <form onSubmit={submitEmail} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-[#684b3d]" htmlFor="contact-name">Tu nombre
                <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} className="field" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#684b3d]" htmlFor="contact-email">Tu correo
                <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#684b3d]" htmlFor="contact-message">Mensaje
                <textarea id="contact-message" name="message" required minLength={3} maxLength={2000} rows={6} className="field resize-y" value={message} onChange={(event) => setMessage(event.target.value)} />
                <span className="text-right text-xs font-normal text-[#927466]">{message.length}/2000 caracteres</span>
              </label>
              {emailNotice && <p role="status" aria-live="polite" className="rounded-xl bg-[#efe4d8] px-4 py-3 text-sm text-[#684b3d]">{emailNotice}</p>}
              {!canOpenEmail && <p role="status" className="rounded-xl bg-[#efe4d8] px-4 py-3 text-sm text-[#684b3d]">El correo de contacto aún no está configurado. Puedes escribirnos por WhatsApp.</p>}
              <button type="submit" disabled={!canOpenEmail} className="primary-button min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">Abrir aplicación de correo</button>
            </form>
          </section>

          <section aria-labelledby="whatsapp-title" className="flex flex-col justify-between rounded-[1.5rem] border border-[#decbbb] bg-[#efe4d8] p-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7725a]">Atención directa</p>
              <h2 id="whatsapp-title" className="mt-2 text-2xl font-medium italic text-[#6d4c3a]">También estamos en WhatsApp</h2>
              <p className="mt-3 leading-7 text-[#806557]">Preparamos el mensaje con tu nombre y lo que escribiste para que puedas continuar desde WhatsApp.</p>
            </div>
            <div className="mt-8">
              <a href={canOpenWhatsApp ? whatsappUrl : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!canOpenWhatsApp} tabIndex={canOpenWhatsApp ? 0 : -1} className={`inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d4c3a] ${canOpenWhatsApp ? "bg-[#4f8060] hover:-translate-y-0.5 hover:bg-[#3f6b4e]" : "cursor-not-allowed bg-[#9bb2a0]"}`}>Continuar por WhatsApp</a>
              {!canOpenWhatsApp && <p className="mt-3 text-center text-xs text-[#806557]">Escribe tu nombre y mensaje para preparar el enlace.</p>}
              <p className="mt-4 text-center text-sm text-[#684b3d]">+57 319 558 3957</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
