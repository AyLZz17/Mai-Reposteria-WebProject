export function parseCopAmount(value: number | string): number | null {
  if (typeof value === 'string' && !/^\s*\d+(?:\.\d+)?\s*$/.test(value)) return null;

  const amount = typeof value === 'number' ? value : Number(value.trim());
  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount);
}

export function formatCopPrice(value: number | string): string {
  const amount = parseCopAmount(value);
  return amount === null ? 'Precio no disponible' : `$${amount.toLocaleString('es-CO')}`;
}
