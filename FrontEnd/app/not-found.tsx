import Link from "next/link";

export const metadata = {
  title: "404 - Página no encontrada | Mai Repostería",
  description: "La página solicitada no existe o no es un error disponible.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-xl bg-[#fdfaf7] rounded-3xl border border-[#d8c5b4] p-8 md:p-12 shadow-[0_12px_26px_rgba(126,86,64,0.15)] text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f0e3d5] text-4xl mb-6 shadow-inner">
          <span role="img" aria-label="Error 404">
            🔍
          </span>
        </div>

        <div className="text-sm font-bold tracking-widest text-[#a7725a] uppercase mb-2">
          Código de Error HTTP
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-[#523326] tracking-tight">
          404
        </h1>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-[#694d3e]">
          Página no encontrada
        </h2>

        <p className="mt-4 text-base text-[#7e5b49] leading-relaxed max-w-md mx-auto">
          Lo sentimos, el recurso o código de error solicitado no existe o no está habilitado como una página de error visible.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#a7725a] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#924d3e] transition-colors"
          >
            ← Volver al inicio
          </Link>
          <Link
            href="/errores"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#d8c5b4] bg-white px-6 py-3 text-sm font-semibold text-[#694d3e] hover:bg-[#f0e3d5] transition-colors"
          >
            Ver catálogo de errores
          </Link>
        </div>
      </div>
    </div>
  );
}
