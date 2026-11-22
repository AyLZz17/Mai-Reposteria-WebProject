'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductReviews, submitProductReview, type ProductReview, type ProductReviewSummary } from '../lib/api';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function StarDisplay({ rating, label }: { rating: number; label: string }) {
  const filled = Math.round(rating);
  return <span role="img" aria-label={label} className="inline-flex gap-0.5 text-[#c98b37]">{Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true">{index < filled ? '★' : '☆'}</span>)}</span>;
}

export default function ProductReviews({ productId, summary }: { productId?: string; summary?: ProductReviewSummary }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!productId || !UUID_PATTERN.test(productId)) return null;
  const validProductId = productId;
  const averageRating = summary?.averageRating || 0;
  const reviewCount = summary?.reviewCount || 0;

  async function loadReviews() {
    if (loaded || loading) return;
    setLoading(true); setError('');
    try { setReviews(await getProductReviews(validProductId)); setLoaded(true); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las reseñas.'); }
    finally { setLoading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setSubmitting(true);
    try {
      await submitProductReview(validProductId, { rating, title, comment });
      setMessage('Gracias. Tu reseña quedo pendiente de revision antes de publicarse.');
      setTitle(''); setComment(''); setRating(5);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible enviar la reseña.');
    } finally { setSubmitting(false); }
  }

  return (
    <details className="mt-4 rounded-xl border border-[#e3d1c0] bg-[#fffaf6] text-left" onToggle={(event) => { if (event.currentTarget.open) void loadReviews(); }}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm text-[#684b3d] outline-none focus-visible:ring-2 focus-visible:ring-[#805744]">
        <span className="flex flex-wrap items-center gap-2">
          {reviewCount > 0 ? <><StarDisplay rating={averageRating} label={`${averageRating.toFixed(1)} de 5 estrellas`} /><strong>{averageRating.toFixed(1)}</strong><span>({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})</span></> : <span className="text-[#806557]">Aún sin calificaciones</span>}
        </span>
        <span className="font-semibold text-[#805744]">Ver / opinar <span aria-hidden="true">⌄</span></span>
      </summary>
      <div className="space-y-4 border-t border-[#ead8ca] p-4">
        {loading && <p role="status" className="text-sm text-[#806557]">Cargando reseñas…</p>}
        {error && <p role="alert" className="rounded-lg bg-[#faebe7] p-3 text-sm text-[#8b3527]">{error}</p>}
        {loaded && reviews.length === 0 && <p className="text-sm text-[#806557]">Todavía no hay reseñas publicadas. Puedes ser la primera persona en opinar.</p>}
        {reviews.map((review) => (
          <article key={`${review.createdAt}-${review.title}`} className="rounded-xl border border-[#ead8ca] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><StarDisplay rating={review.rating} label={`${review.rating} de 5 estrellas`} /><time className="text-xs text-[#927466]" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</time></div>
            <h4 className="mt-2 font-semibold text-[#523326]">{review.title}</h4>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#684b3d]">{review.comment}</p>
          </article>
        ))}
        <div className="rounded-xl bg-[#f3efe8] p-4">
          <h4 className="font-semibold text-[#523326]">Comparte tu experiencia</h4>
          {!user ? <p className="mt-2 text-sm leading-6 text-[#806557]">Inicia sesión para dejar una reseña. <Link href="/login" className="font-semibold text-[#805744] underline underline-offset-4">Iniciar sesión</Link></p> : (
            <form onSubmit={submit} className="mt-3 grid gap-3">
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-[#684b3d]">Tu calificación</legend>
                <div className="flex gap-1" role="group" aria-label="Calificación de 1 a 5 estrellas">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return <button key={value} type="button" aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`} aria-pressed={rating === value} onClick={() => setRating(value)} className={`rounded-sm text-3xl leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#805744] ${value <= rating ? 'text-[#c98b37]' : 'text-[#bda995]'}`}>★</button>;
                  })}
                </div>
              </fieldset>
              <label className="grid gap-1 text-sm font-medium text-[#684b3d]">Título
                <input required minLength={3} maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 rounded-lg border border-[#d8c5b4] bg-white px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#805744]" />
              </label>
              <label className="grid gap-1 text-sm font-medium text-[#684b3d]">Tu reseña
                <textarea required minLength={10} maxLength={1500} rows={4} value={comment} onChange={(event) => setComment(event.target.value)} className="resize-y rounded-lg border border-[#d8c5b4] bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#805744]" />
                <span className="text-right text-xs font-normal text-[#927466]">{comment.length}/1500</span>
              </label>
              <button type="submit" disabled={submitting} className="primary-button min-h-11">{submitting ? 'Enviando…' : 'Enviar reseña'}</button>
            </form>
          )}
          {message && <p role="status" className="mt-3 text-sm font-medium text-[#3f6b4e]">{message}</p>}
        </div>
      </div>
    </details>
  );
}
