import Link from "next/link";
import { ERRORES_SOPORTADOS } from "./erroresData";

export const metadata = {
  title: "Códigos de Error HTTP",
  description: "Listado de páginas de errores HTTP disponibles en Mai Repostería",
};

export default function ErroresIndexPage() {
  const listaErrores = Object.values(ERRORES_SOPORTADOS);

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e] flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-[#fdfaf7] rounded-3xl border border-[#d8c5b4] p-8 md:p-12 shadow-[0_12px_26px_rgba(126,86,64,0.15)]">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#f0e3d5] text-[#924d3e] font-semibold text-xs tracking-wider uppercase mb-3">
              Catálogo de Errores
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#523326]">
              Páginas de Error HTTP
            </h1>
            <p className="mt-3 text-sm md:text-base text-[#7e5b49] max-w-xl mx-auto">
              Solo se documentan y muestran páginas para códigos de estado 4xx y 5xx.
              Las respuestas exitosas nunca muestran pantallas de estado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listaErrores.map((error) => (
              <Link
                key={error.codigo}
                href={`/errores/${error.codigo}`}
                className="group flex flex-col p-5 rounded-2xl bg-white border border-[#e4d5c7] hover:border-[#a7725a] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-[#a7725a] group-hover:text-[#924d3e]">
                    {error.codigo}
                  </span>
                  <span className="text-2xl" role="img" aria-label={error.titulo}>
                    {error.icono}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#523326] group-hover:text-[#924d3e] transition-colors">
                  {error.titulo}
                </h2>
                <p className="mt-2 text-xs text-[#7e5b49] line-clamp-2">
                  {error.descripcion}
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-[#a7725a] group-hover:translate-x-1 transition-transform">
                  Ver detalle →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#e4d5c7] flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#a7725a] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#924d3e] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
