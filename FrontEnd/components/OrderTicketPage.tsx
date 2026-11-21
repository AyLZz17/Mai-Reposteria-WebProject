'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { getOrderPreview, getMyOrders, type StoreOrder } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from './CartProvider';

const statusLabel: Record<string, string> = {
  PENDING_CONFIRMATION: 'Pendiente de confirmación',
  CONFIRMED: 'Pedido confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo para entregar',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrderTicketPage({ ticket }: { ticket: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const [myOrders, setMyOrders] = useState<StoreOrder[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(true);
  const [myOrdersError, setMyOrdersError] = useState('');
  const [ordersReloadKey, setOrdersReloadKey] = useState(0);
  const [activeTicket, setActiveTicket] = useState(ticket);
  const [reloadKey, setReloadKey] = useState(0);
  const [ticketInput, setTicketInput] = useState(ticket);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setMyOrders([]); setMyOrdersLoading(false); setMyOrdersError(''); return; }
    let active = true;
    const loadOrders = (showLoading: boolean) => {
      if (showLoading) setMyOrdersLoading(true);
      getMyOrders()
        .then((orders) => { if (active) { setMyOrders(orders); setMyOrdersError(''); } })
        .catch((loadError) => { if (active && showLoading) setMyOrdersError(loadError instanceof Error ? loadError.message : 'No pudimos cargar tus pedidos.'); })
        .finally(() => { if (active && showLoading) setMyOrdersLoading(false); });
    };
    loadOrders(true);
    const refreshTimer = window.setInterval(() => loadOrders(false), 30000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [authLoading, user?.id, ordersReloadKey]);

  useEffect(() => {
    let active = true;
    setOrder(null);
    setError('');
    if (!activeTicket) { setLoading(false); return () => { active = false; }; }
    const loadOrder = (showLoading: boolean) => {
      if (showLoading && active) setLoading(true);
      getOrderPreview(activeTicket.trim().toUpperCase())
        .then((result) => { if (active) { setOrder(result); setError(''); } })
        .catch((loadError) => { if (active && showLoading) setError(loadError instanceof Error ? loadError.message : 'No encontramos ese pedido.'); })
        .finally(() => { if (active && showLoading) setLoading(false); });
    };
    loadOrder(true);
    const refreshTimer = window.setInterval(() => loadOrder(false), 30000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [activeTicket, reloadKey]);

  function submitTicket(event: FormEvent) {
    event.preventDefault();
    const normalized = ticketInput.trim().toUpperCase();
    setError(''); setOrder(null); setLoading(true); setActiveTicket(normalized); setReloadKey((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#f3efe8] px-4 py-8 text-[#694d3e] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex rounded-sm text-sm font-semibold text-[#805744] underline decoration-[#c9a486] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d4c3a]">Mai Repostería</Link>
        <section className="mt-6 rounded-[1.5rem] border border-[#decbbb] bg-[#f9f5f0] p-5 shadow-[0_14px_34px_rgba(136,97,69,0.09)] sm:p-8">
          <div className="mb-7 rounded-2xl border border-[#ead8ca] bg-white/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a7725a]">Tu cuenta</p><h2 className="mt-1 text-2xl font-medium italic text-[#6d4c3a]">Mis pedidos</h2></div>
              {user && <button type="button" onClick={() => setOrdersReloadKey((current) => current + 1)} disabled={myOrdersLoading} className="secondary-button min-h-10">Actualizar</button>}
            </div>
            {authLoading || myOrdersLoading ? <p role="status" className="mt-4 text-sm text-[#806557]">Cargando tus pedidos…</p> : !user ? (
              <p className="mt-4 text-sm leading-6 text-[#806557]">Inicia sesión con la cuenta que usaste al comprar para ver aquí tus pedidos. <Link href="/login" className="font-semibold text-[#805744] underline underline-offset-4">Iniciar sesión</Link></p>
            ) : myOrdersError ? (
              <p role="alert" className="mt-4 text-sm text-[#8b3527]">{myOrdersError}</p>
            ) : myOrders.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-[#806557]">Todavía no tienes pedidos registrados en esta cuenta.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {myOrders.map((myOrder) => (
                  <Link key={myOrder.ticket} href={`/pedido/${encodeURIComponent(myOrder.ticket)}`} className="grid gap-2 rounded-xl border border-[#ead8ca] bg-[#fffaf6] p-4 transition hover:border-[#c9a486] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#805744] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <span className="min-w-0"><strong className="block break-all text-sm text-[#523326]">{myOrder.ticket}</strong><span className="mt-1 block text-xs text-[#806557]">{statusLabel[myOrder.status] || 'En revisión'} · {myOrder.fulfillment === 'DELIVERY' ? 'Domicilio' : 'Recoger personalmente'}</span>{myOrder.estimatedDeliveryDate && <span className="mt-1 block text-xs text-[#806557]">Entrega estimada: {new Date(`${myOrder.estimatedDeliveryDate}T12:00:00`).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>}</span>
                    <span className="flex items-center justify-between gap-3 text-sm sm:flex-col sm:items-end"><strong className="text-[#523326]">{formatPrice(myOrder.total)}</strong><span className="text-xs font-semibold text-[#805744]">Ver seguimiento →</span></span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="mb-7 rounded-2xl bg-[#efe4d8] p-4 sm:p-5">
            <h1 className="text-2xl font-medium italic text-[#6d4c3a]">Sigue tu pedido</h1>
            <p className="mt-2 text-sm leading-6 text-[#806557]">Escribe el ticket que recibiste al hacer tu pedido. El estado y la fecha estimada se actualizan automáticamente.</p>
            <form onSubmit={submitTicket} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="tracking-ticket" className="sr-only">Número de ticket</label>
              <input id="tracking-ticket" required maxLength={28} pattern="MAI-[A-Fa-f0-9]{24}" value={ticketInput} onChange={(event) => setTicketInput(event.target.value.toUpperCase())} placeholder="MAI-0123456789ABCDEF01234567" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#d8c5b4] bg-white px-4 text-sm uppercase text-[#523326] outline-none focus-visible:ring-2 focus-visible:ring-[#805744]" />
              <button type="submit" disabled={loading || ticketInput.trim().length < 8} className="primary-button min-h-12 sm:min-w-40">Consultar pedido</button>
            </form>
          </div>
          {loading ? <p role="status" className="py-12 text-center">Cargando el ticket…</p> : error ? (
            <div className="py-8 text-center">
              <h1 className="text-3xl italic text-[#6d4c3a]">Ticket no encontrado</h1>
              <p role="alert" className="mt-3 text-sm text-[#806557]">{error}</p>
              <Link href="/shop" className="primary-button mt-6 inline-flex">Volver a la tienda</Link>
            </div>
          ) : order ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a7725a]">Consulta de pedido</p>
              <h1 className="mt-2 break-all text-3xl font-medium italic text-[#6d4c3a] sm:text-4xl">Ticket {order.ticket}</h1>
              <p className="mt-3 inline-flex rounded-full bg-[#efe4d8] px-4 py-2 text-sm font-semibold text-[#684b3d]">{statusLabel[order.status] || 'En revisión'}</p>
              <p className="mt-4 text-sm leading-6 text-[#806557]">La tienda actualiza manualmente el avance del pedido. Esta página consulta los cambios cada 30 segundos.</p>
              {order.estimatedDeliveryDate && <p className="mt-3 rounded-xl border border-[#d8c5b4] bg-white/70 p-4 text-sm font-semibold text-[#684b3d]">Fecha estimada de entrega: {new Date(`${order.estimatedDeliveryDate}T12:00:00`).toLocaleDateString('es-CO', { dateStyle: 'long' })}</p>}

              <div className="mt-7 space-y-3">
                {order.items.map((item) => (
                  <article key={item.productId} className="flex items-center gap-4 rounded-2xl border border-[#ead8ca] bg-white/70 p-3 sm:p-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl bg-[#efe2d4] object-cover" style={{ objectPosition: item.position }} />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-[#523326]">{item.name}</h2>
                      <p className="mt-1 text-sm text-[#806557]">{item.quantity} × {formatPrice(item.unitPrice)}</p>
                    </div>
                    <strong className="text-right text-sm text-[#523326]">{formatPrice(item.subtotal)}</strong>
                  </article>
                ))}
              </div>

              <dl className="mt-6 space-y-3 rounded-2xl bg-[#efe4d8] p-5 text-sm">
                <div className="flex justify-between gap-4"><dt>Entrega</dt><dd>{order.fulfillment === 'DELIVERY' ? 'Domicilio' : 'Recoger personalmente'}</dd></div>
                <div className="flex justify-between gap-4"><dt>Productos</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                <div className="flex justify-between gap-4"><dt>Domicilio</dt><dd>{formatPrice(order.deliveryFee)}</dd></div>
                <div className="flex justify-between gap-4 border-t border-[#d8c5b4] pt-3 text-base font-bold text-[#523326]"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-[#806557]">Creado: {new Date(order.createdAt).toLocaleString('es-CO')}</p>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
