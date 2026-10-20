import Link from "next/link";
import { notFound } from "next/navigation";
import { ERRORES_SOPORTADOS } from "../erroresData";

interface ErrorPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export async function generateMetadata({ params }: ErrorPageProps) {
  const { codigo } = await params;
  const error = ERRORES_SOPORTADOS[codigo];

  if (!error) {
    return {
      title: "Error 404 - Página no encontrada",
    };
  }

  return {
    title: `Error ${error.codigo}: ${error.titulo} | Mai Repostería`,
    description: error.descripcion,
  };
}

export default async function ErrorDetailPage({ params }: ErrorPageProps) {
  const { codigo } = await params;
  const error = ERRORES_SOPORTADOS[codigo];

  // Regla RF-01: Solo códigos 400, 401, 403, 404, 500 y 503.
  // Cualquier otro código (incluidos 200, 201, 204 o desconocidos como 999) activa notFound() -> 404.
  if (!error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#694d3e] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-xl bg-[#fdfaf7] rounded-3xl border border-[#d8c5b4] p-8 md:p-12 shadow-[0_12px_26px_rgba(126,86,64,0.15)] text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f0e3d5] text-4xl mb-6 shadow-inner">
          <span role="img" aria-label={error.titulo}>
            {error.icono}
          </span>
        </div>

        <div className="text-sm font-bold tracking-widest text-[#a7725a] uppercase mb-2">
          Código de Error HTTP
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-[#523326] tracking-tight">
          {error.codigo}
        </h1>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-[#694d3e]">
          {error.titulo}
        </h2>

        <p className="mt-4 text-base text-[#7e5b49] leading-relaxed max-w-md mx-auto">
          {error.descripcion}
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
            Ver todos los errores
          </Link>
        </div>
      </div>
    </div>
  );
}
