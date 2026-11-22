'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCartOrder, getOrderConfig, type StoreOrder } from '../lib/api';
import { formatPrice, useCart } from './CartProvider';

type Fulfillment = 'DELIVERY' | 'PICKUP';

export default function OrderCheckout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { items, subtotal, refreshCart } = useCart();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [fulfillment, setFulfillment] = useState<Fulfillment>('DELIVERY');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    if (open && user?.name && !name) setName(user.name);
  }, [open, user?.name]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingConfig(true);
    setError('');
    getOrderConfig()
      .then((config) => { if (active) setDeliveryFee(config.deliveryFee); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : 'No pudimos consultar el domicilio.'); })
      .finally(() => { if (active) setLoadingConfig(false); });
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        setOrder(null);
        setAcceptedPrivacy(false);
        onClose();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open, order, submitting]);

  const total = subtotal + (fulfillment === 'DELIVERY' ? deliveryFee || 0 : 0);

  function closeCheckout() {
    if (submitting) return;
    setOrder(null);
    setError('');
    setAcceptedPrivacy(false);
    setName(user?.name || '');
    setPhone('');
    setAddress('');
    setNeighborhood('');
    setInstructions('');
    setFulfillment('DELIVERY');
    onClose();
  }
  const whatsappUrl = useMemo(() => {
    if (!order) return '';
    const detailUrl = `${window.location.origin}/pedido/${encodeURIComponent(order.ticket)}`;
    const deliveryText = order.fulfillment === 'DELIVERY'
      ? `Domicilio: ${formatPrice(order.deliveryFee)}\nDirecciÃ³n: ${address.trim()}${neighborhood.trim() ? `, ${neighborhood.trim()}` : ''}${instructions.trim() ? `\nIndicaciones: ${instructions.trim()}` : ''}`
      : 'Entrega: Recoger personalmente';
    const productLines = order.items.map((item) => `- ${item.name} x ${item.quantity}: ${formatPrice(item.subtotal)}`);
    const message = [
      `Hola, quiero solicitar la confirmaciÃ³n del pedido ${order.ticket}.`,
      `Nombre: ${name.trim()}`,
      `TelÃ©fono: ${phone.trim()}`,
      deliveryText,
      'Productos:',
      ...productLines,
      `Subtotal: ${formatPrice(order.subtotal)}`,
      `Total: ${formatPrice(order.total)}`,
      `Fotos y estado del ticket: ${detailUrl}`,
      'Por favor confirma la disponibilidad y el pedido indicando este nÃºmero de ticket.',
    ].join('\n');
    return `https://wa.me/573195583957?${new URLSearchParams({ text: message })}`;
  }, [address, instructions, name, neighborhood, order, phone]);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const createdOrder = await createCartOrder({
        name,
        phone,
        fulfillment,
        address: fulfillment === 'DELIVERY' ? address : '',
        neighborhood: fulfillment === 'DELIVERY' ? neighborhood : '',
        instructions,
        privacyConsent: acceptedPrivacy,
      });
      setOrder(createdOrder);
      await refreshCart();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo registrar el pedido. IntÃ©ntalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#241b17]/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting && !order) closeCheckout(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-[#decbbb] bg-[#f8f2eb] p-5 text-[#694d3e] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a7725a]">Pedido por WhatsApp</p>
            <h2 id="checkout-title" className="mt-2 text-3xl font-medium italic text-[#6d4c3a]">{order ? 'Tu ticket está listo' : '¿Cómo te lo entregamos?'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#806557]">{order ? 'El pedido quedó guardado y espera confirmación de Mai Repostería.' : 'Déjanos tus datos. Primero registraremos el pedido y luego podrás enviarlo a la vendedora por WhatsApp.'}</p>
          </div>
          {!submitting && <button type="button" onClick={closeCheckout} aria-label="Cerrar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-[#806557] hover:bg-[#efe4d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4c3a]">×</button>}
        </div>

        {order ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-[#d8c5b4] bg-white/70 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#927466]">Número de ticket</p>
              <p className="mt-2 break-all text-2xl font-bold tracking-[0.08em] text-[#523326]">{order.ticket}</p>
              <p className="mt-3 text-sm text-[#806557]">Estado: pendiente de confirmación de la vendedora</p>
            </div>
            <div className="rounded-2xl bg-[#efe4d8] p-4 text-sm">
              <div className="flex justify-between gap-4"><span>Productos</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="mt-2 flex justify-between gap-4"><span>Domicilio</span><span>{formatPrice(order.deliveryFee)}</span></div>
              <div className="mt-3 flex justify-between gap-4 border-t border-[#d8c5b4] pt-3 font-bold text-[#523326]"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="primary-button flex min-h-12 w-full items-center justify-center text-center">Enviar pedido y ticket por WhatsApp</a>
            <Link href={`/pedido/${encodeURIComponent(order.ticket)}`} onClick={closeCheckout} className="block text-center text-sm font-semibold text-[#805744] underline decoration-[#c9a486] underline-offset-4">Ver ticket, fotos y estado del pedido</Link>
            <p className="text-center text-xs leading-5 text-[#806557]">WhatsApp abrirá un mensaje preparado. Revísalo y pulsa Enviar para solicitar la confirmación.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold" htmlFor="order-customer-name">Nombre completo
              <input id="order-customer-name" required minLength={3} maxLength={120} autoComplete="name" className="field" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold" htmlFor="order-customer-phone">Teléfono o WhatsApp
              <input id="order-customer-phone" required type="tel" minLength={7} maxLength={20} autoComplete="tel" placeholder="+57 300 000 0000" className="field" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm font-semibold">Forma de entrega</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#decbbb] bg-white/70 p-3 text-sm"><input type="radio" name="fulfillment" value="DELIVERY" checked={fulfillment === 'DELIVERY'} onChange={() => setFulfillment('DELIVERY')} className="h-4 w-4 accent-[#6d4c3a]" /> Domicilio</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#decbbb] bg-white/70 p-3 text-sm"><input type="radio" name="fulfillment" value="PICKUP" checked={fulfillment === 'PICKUP'} onChange={() => setFulfillment('PICKUP')} className="h-4 w-4 accent-[#6d4c3a]" /> Recoger personalmente</label>
            </fieldset>
            {fulfillment === 'DELIVERY' && <>
              <label className="grid gap-2 text-sm font-semibold" htmlFor="order-address">Dirección de entrega
                <input id="order-address" required minLength={5} maxLength={250} autoComplete="street-address" className="field" placeholder="Calle, carrera, número y edificio" value={address} onChange={(event) => setAddress(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold" htmlFor="order-neighborhood">Barrio o sector <span className="font-normal text-[#927466]">(opcional)</span>
                <input id="order-neighborhood" maxLength={120} autoComplete="address-level3" className="field" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
              </label>
            </>}
            <label className="grid gap-2 text-sm font-semibold" htmlFor="order-instructions">Indicaciones adicionales <span className="font-normal text-[#927466]">(opcional)</span>
              <textarea id="order-instructions" maxLength={500} rows={3} className="field resize-y" placeholder="Referencia para encontrar el lugar o detalles del pedido" value={instructions} onChange={(event) => setInstructions(event.target.value)} />
            </label>

            <div className="rounded-xl bg-[#efe4d8] p-4 text-sm">
              <div className="flex justify-between gap-4"><span>Productos ({items.length} tipos)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="mt-2 flex justify-between gap-4"><span>Domicilio</span><span>{loadingConfig ? 'Consultando…' : fulfillment === 'DELIVERY' ? formatPrice(deliveryFee || 0) : formatPrice(0)}</span></div>
              <div className="mt-3 flex justify-between gap-4 border-t border-[#d8c5b4] pt-3 font-bold text-[#523326]"><span>Total estimado</span><span>{formatPrice(total)}</span></div>
            </div>
            <label className="flex items-start gap-3 text-xs leading-5 text-[#684b3d]"><input required type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1 h-4 w-4 accent-[#6d4c3a]" />Autorizo el uso de estos datos para registrar y coordinar este pedido. <Link href="/politica-de-privacidad" target="_blank" className="shrink-0 font-semibold underline underline-offset-2">Ver política</Link></label>
            {error && <p role="alert" className="rounded-xl border border-[#d88975] bg-[#faebe7] p-3 text-sm text-[#8b3527]">{error}</p>}
            <button type="submit" disabled={submitting || loadingConfig || deliveryFee === null || items.length === 0} className="primary-button min-h-12 w-full disabled:cursor-wait disabled:opacity-60">{submitting ? 'Registrando pedido…' : 'Registrar pedido y generar ticket'}</button>
            <p className="text-center text-xs leading-5 text-[#806557]">El pedido queda pendiente hasta que la vendedora confirme disponibilidad y ticket por WhatsApp.</p>
          </form>
        )}
      </section>
    </div>
  );
}
