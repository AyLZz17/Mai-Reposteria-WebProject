"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function UserNav() {
  const { user, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-sm text-[#6d4c3a]">
        …
      </div>
    );
  }

  // Sin sesión: botón que dirige al login
  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        title="Iniciar sesión"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b38d6a] bg-[linear-gradient(135deg,#f8f2eb_0%,#f0e4d7_100%)] text-xl text-[#6d4c3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(123,92,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f8f2eb_0%,#ead7c0_100%)]"
      >
        👤
      </Link>
    );
  }

  // Con sesión: nombre del usuario y menú con cerrar sesión
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={`Cuenta de ${user.name}`}
        className="flex h-12 items-center gap-2 rounded-full border border-[#a7725a] bg-[#f8f2eb] px-3.5 py-1 text-sm font-semibold text-[#6d4c3a] shadow-[0_2px_8px_rgba(123,92,71,0.12)] transition-all hover:bg-[#ead7c0]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a7725a] text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden md:inline-block max-w-[120px] truncate text-left">
          {user.name}
        </span>
        <span className="text-xs text-[#a7725a]">▾</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#d8c5b4] bg-[#fdfaf7] p-2 shadow-[0_10px_25px_rgba(126,86,64,0.18)] z-50 animate-in fade-in">
          <div className="border-b border-[#e4d5c7] px-3 py-2">
            <p className="text-xs font-semibold text-[#523326] truncate">{user.name}</p>
            <p className="text-[0.7rem] text-[#8d6753] truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="mt-1 w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#924d3e] hover:bg-[#f0e3d5] transition-colors"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
