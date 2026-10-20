import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | Mai Repostería",
  description: "Términos y condiciones de uso de Mai Repostería",
};

export default function TerminosPage() {
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
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#523326]">
              Términos y Condiciones
            </h1>
            <p className="mt-2 text-sm text-[#7e5b49]">
              Última actualización: Octubre 2026 · Mai Repostería Artesanal
            </p>
          </div>

          <div className="space-y-6 text-sm sm:text-base text-[#694d3e] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">1. Introducción y Aceptación</h2>
              <p>
                Bienvenido a Mai Repostería. Al acceder, navegar o utilizar nuestra plataforma web y realizar compras, usted acepta cumplir con estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de los términos aquí expuestos, le solicitamos abstenerse de utilizar el sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">2. Pedidos y Disponibilidad</h2>
              <p>
                Todos los productos de repostería artesanal están sujetos a disponibilidad de ingredientes y cupos de producción diaria. Las fotografías de los productos son de referencia; al tratarse de elaboraciones artesanales, pueden existir ligeras variaciones en decoración o tonalidad sin alterar su calidad y sabor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">3. Precios y Formas de Pago</h2>
              <p>
                Los precios expresados en la tienda están en pesos colombianos (COP) e incluyen los impuestos aplicables. Nos reservamos el derecho de modificar precios en cualquier momento sin previo aviso. Los métodos de pago habilitados incluyen pasarelas seguras y transferencias bancarias según disponibilidad al momento del checkout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">4. Políticas de Envío y Entrega</h2>
              <p>
                Los tiempos de entrega y coberturas se calculan al momento de confirmar el pedido. Es responsabilidad del cliente suministrar una dirección exacta y una persona autorizada para recibir productos perecederos. No nos hacemos responsables por demoras causadas por información errónea o ausencia en el lugar de entrega.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#523326] mb-2">5. Cancelaciones y Devoluciones</h2>
              <p>
                Debido a la naturaleza perecedera de nuestros productos alimenticios, las cancelaciones o cambios de pedidos solo se aceptan con un mínimo de 24 horas de antelación al despacho programado. En caso de inconformidad justificada con el estado del producto recibido, el cliente deberá comunicarse dentro de las primeras 4 horas tras la entrega.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-[#e4d5c7] flex justify-between items-center">
            <Link
              href="/politica-de-privacidad"
              className="text-xs sm:text-sm font-semibold text-[#a7725a] hover:underline"
            >
              Ver Política de Privacidad →
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
