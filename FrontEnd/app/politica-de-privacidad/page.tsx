import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Mai Repostería",
  description: "Política de tratamiento de datos personales y privacidad de Mai Repostería",
};

export default function PoliticaPrivacidadPage() {
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
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="rounded-3xl border border-[#d8c5b4] bg-[#fdfaf7] p-8 sm:p-12 shadow-[0_12px_26px_rgba(126,86,64,0.12)]">
          <div className="border-b border-[#e4d5c7] pb-6 mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#f0e3d5] text-[#924d3e] font-semibold text-xs uppercase tracking-wider mb-2">
              Privacidad y Seguridad
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#523326]">
              Política de Privacidad
            </h1>
            <p className="mt-2 text-sm text-[#7e5b49]">
              Última actualización: Octubre 2026 · Tratamiento de datos personales
            </p>
          </div>

          <div className="space-y-6 text-sm sm:text-base text-[#694d3e] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">1. Responsable del Tratamiento de Datos</h2>
              <p>
                Mai Repostería es responsable del tratamiento y protección de sus datos personales recolectados a través de esta plataforma digital, en concordancia con las leyes vigentes de protección de datos personales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">2. Información que Recopilamos</h2>
              <p>
                Para prestar nuestros servicios de venta y despacho, recopilamos información personal como: nombre y apellidos, dirección de correo electrónico, número telefónico, dirección de entrega física y detalles de compras realizadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">3. Finalidad del Uso de los Datos</h2>
              <p>
                Sus datos son utilizados exclusivamente para: procesar órdenes de compra, coordinar entregas de productos de repostería, enviar actualizaciones sobre el estado de su pedido, atender consultas y, si lo autoriza, compartir novedades o promociones exclusivas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">4. Seguridad y Confidencialidad</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra pérdida, acceso no autorizado o alteración. Nunca vendemos ni compartimos sus datos personales con terceros para fines comerciales ajenos a Mai Repostería.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">5. Derechos del Titular (Habeas Data)</h2>
              <p>
                Usted tiene derecho a conocer, actualizar, rectificar o solicitar la supresión de sus datos personales de nuestras bases de datos en cualquier momento escribiendo a nuestros canales de contacto oficiales o mediante las preferencias de su cuenta.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-[#e4d5c7] flex justify-between items-center">
            <Link
              href="/terminos-y-condiciones"
              className="text-xs sm:text-sm font-semibold text-[#a7725a] hover:underline"
            >
              ← Ver Términos y Condiciones
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-[#a7725a] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#924d3e] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
