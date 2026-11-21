function getApiUrl() {
  if (typeof window !== 'undefined') return '/api/v1';
  return process.env.API_INTERNAL_URL || 'http://localhost:8080/api/v1';
}
const TOKEN_KEY = 'mai_access_token';

export interface User { id: string; email: string; name: string; roles?: string[]; acceptedTerms?: boolean; }
export interface AuthResponse { status: number; user?: User; accessToken?: string; refreshToken?: string; message?: string; }
export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
export type CatalogProduct = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  main_image_url?: string | null;
  images?: string[];
  stock?: number;
  category_id?: string | null;
  category_name?: string;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
  display_colors?: string[];
  image_position?: string;
};
export type CatalogCategory = { id: string; name: string; slug: string; description?: string | null; image_url?: string | null; is_active?: boolean };
export type AdminAuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  outcome: 'SUCCESS' | 'FAILURE';
  summary: string;
  requestId?: string | null;
  createdAt: string;
};
export type StorefrontSettings = {
  id: number;
  hero_title: string;
  hero_background_url: string;
  hero_logo_url: string;
  hero_overlay_color: string;
  hero_title_color: string;
  card_button_label: string;
  about_text: string;
  footer_x_url?: string;
  footer_instagram_url?: string;
  footer_facebook_url?: string;
};
export type StorefrontResponse = { settings: StorefrontSettings; products: CatalogProduct[] };
export type OrderItem = { productId: string; name: string; quantity: number; unitPrice: number; subtotal: number; image: string; position: string };
export type StoreOrder = { ticket: string; status: string; fulfillment: 'DELIVERY' | 'PICKUP'; items: OrderItem[]; subtotal: number; deliveryFee: number; total: number; currency: 'COP'; createdAt: string; updatedAt: string; estimatedDeliveryDate?: string | null; confirmedAt?: string; customer?: { name: string; phone: string; fulfillment: 'DELIVERY' | 'PICKUP'; address: string; neighborhood: string; instructions: string } };
export type ProductReviewSummary = { productId: string; averageRating: number; reviewCount: number };
export type ProductReview = { id: string; productId: string; productName?: string; reviewerId?: string; rating: number; title: string; comment: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string; updatedAt?: string; moderatedAt?: string | null; moderatedBy?: string | null };

export function getAccessToken() { return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY); }
export function clearAccessToken() { if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY); }

function notifyAuthenticationExpired() {
  clearAccessToken();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mai:auth-expired'));
}

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const requestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  headers.set('X-Request-Id', requestId);
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${getApiUrl()}${path}`, { ...init, headers });
  if (response.status === 401 && (token || path !== '/auth/login')) notifyAuthenticationExpired();
  return response;
}
async function responseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}));
  const requestId = response.headers.get('X-Request-Id');
  if (response.status === 413) {
    return 'La imagen o los datos superan el tamaÃ±o permitido. Usa una imagen de mÃ¡ximo 4 MB.';
  }
  if (response.status === 401) return 'Tu sesiÃ³n no es vÃ¡lida o expirÃ³. Inicia sesiÃ³n nuevamente para continuar.';
  const detail = typeof data.message === 'string' ? data.message : typeof data.error === 'string' ? data.error : '';
  if ([502, 503, 504].includes(response.status)) {
    return `${detail || 'El servicio de catÃ¡logo no estÃ¡ disponible temporalmente.'}${requestId ? ` Referencia: ${requestId}` : ''}`;
  }
  if (detail) return `${detail}${requestId ? ` (Referencia: ${requestId})` : ''}`;
  return `${fallback} (HTTP ${response.status})${requestId ? ` Â· ${requestId}` : ''}`;
}
function mapUser(data: any): User | undefined { if (!data) return undefined; return { id: data.id, email: data.email, name: data.name || [data.firstName, data.lastName].filter(Boolean).join(' '), roles: data.roles || [] }; }

export async function loginApi(email: string, password: string): Promise<LoginResponse> { try { const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) }); const data = await res.json().catch(() => ({})); if (res.ok && data.accessToken && typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, data.accessToken); return { status: res.status, user: mapUser(data.user), accessToken: data.accessToken, refreshToken: data.refreshToken, message: data.message }; } catch { return { status: 503, message: 'Sin conexiÃ³n con el servidor' }; } }

export async function registerApi(name: string, email: string, password: string): Promise<RegisterResponse> { const parts = name.trim().split(/\s+/); const firstName = parts.shift() || ''; const lastName = parts.join(' ') || firstName; try { const res = await request('/users/register', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password, firstName, lastName }) }); const data = await res.json().catch(() => ({})); return { status: res.status, user: mapUser(data), message: data.message }; } catch { return { status: 503, message: 'Sin conexiÃ³n con el servidor' }; } }

export async function logoutApi(refreshToken?: string) {
  try { await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } finally { clearAccessToken(); }
}

export async function getCatalogProducts(includeInactive = false): Promise<CatalogProduct[]> { const query = includeInactive ? '?is_active=all' : ''; const res = await request(`/catalog/products${query}`); if (!res.ok) throw new Error('No fue posible cargar el catÃ¡logo'); return res.json(); }
export async function getCurrentUser(): Promise<User> { const res = await request('/users/me'); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'SesiÃ³n no vÃ¡lida'); return mapUser(data) as User; }
export async function getCatalogCategories(includeInactive = false): Promise<CatalogCategory[]> { const query = includeInactive ? '?include_inactive=true' : ''; const res = await request(`/catalog/categories${query}`); if (!res.ok) throw new Error('No fue posible cargar las categorÃ­as'); return res.json(); }
export async function getStorefront(): Promise<StorefrontResponse> { const res = await request('/catalog/storefront'); if (!res.ok) throw new Error('No fue posible cargar la portada'); return res.json(); }
export async function updateStorefront(fields: Partial<Omit<StorefrontSettings, 'id'>>) { const res = await request('/catalog/storefront', { method: 'PATCH', body: JSON.stringify(fields) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible actualizar la portada'); return data as StorefrontSettings; }
export async function createCatalogCategory(category: { name: string; slug: string; description?: string; image_url?: string }) { const res = await request('/catalog/categories', { method: 'POST', body: JSON.stringify(category) }); if (!res.ok) throw new Error(await responseError(res, 'No fue posible crear la categorÃ­a')); return res.json(); }
export async function updateCatalogCategory(id: string, fields: Partial<CatalogCategory>) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(fields) }); if (!res.ok) throw new Error(await responseError(res, 'No fue posible actualizar la categorÃ­a')); return res.json(); }
export async function deleteCatalogCategory(id: string) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible eliminar la categorÃ­a'); return data; }
export async function permanentlyDeleteCatalogCategory(id: string) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' }); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'No fue posible eliminar definitivamente la categorÃ­a'); } }
export async function createCatalogProduct(product: { category_id?: string; name: string; slug: string; description: string; price: number; stock: number; main_image_url?: string; is_featured?: boolean; display_order?: number; display_colors?: string[]; image_position?: string; }) { const res = await request('/catalog/products', { method: 'POST', body: JSON.stringify({ ...product, is_customizable: false }) }); if (!res.ok) throw new Error(await responseError(res, 'No fue posible crear el producto')); return res.json(); }
export async function updateCatalogProduct(id: string, fields: Partial<{ category_id: string; name: string; slug: string; description: string; price: number; stock: number; main_image_url: string; is_active: boolean; is_featured: boolean; display_order: number; display_colors: string[]; image_position: string; }>) { const res = await request(`/catalog/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(fields) }); if (!res.ok) throw new Error(await responseError(res, 'No fue posible actualizar el producto')); return res.json(); }
export async function deleteCatalogProduct(id: string) { const res = await request(`/catalog/products/${encodeURIComponent(id)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible eliminar el producto'); return data; }
export async function permanentlyDeleteCatalogProduct(id: string) { const res = await request(`/catalog/products/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' }); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'No fue posible eliminar definitivamente el producto'); } }
export async function promoteUserToAdmin(email: string) { const res = await request('/users/admin-role', { method: 'PATCH', body: JSON.stringify({ email }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible asignar el rol de administrador'); return data as User; }
export async function removeUserAdminRole(email: string) { const res = await request(`/users/admin-role?email=${encodeURIComponent(email)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible quitar el rol de administrador'); return data as User; }
export async function getAdminAuditLogs(limit = 50): Promise<AdminAuditLog[]> { const res = await request(`/users/audit?limit=${encodeURIComponent(String(limit))}`); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible cargar la auditorÃ­a'); return data; }
export async function getCart() { const res = await request('/cart'); if (!res.ok) throw new Error('No fue posible cargar el carrito'); return res.json(); }
export async function getOrderConfig(): Promise<{ deliveryFee: number; currency: 'COP' }> { const res = await request('/cart/order-config'); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible consultar el costo de domicilio'); return data; }
export async function createCartOrder(customer: { name: string; phone: string; fulfillment: 'DELIVERY' | 'PICKUP'; address?: string; neighborhood?: string; instructions?: string; privacyConsent: boolean }): Promise<StoreOrder> { const res = await request('/cart/orders', { method: 'POST', body: JSON.stringify(customer) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible registrar el pedido'); return data; }
export async function getOrderPreview(ticket: string): Promise<StoreOrder> { const res = await request(`/cart/orders/${encodeURIComponent(ticket)}/preview`); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No encontramos ese pedido'); return data; }
export async function getMyOrders(): Promise<StoreOrder[]> { const res = await request('/cart/orders/mine'); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible cargar tus pedidos'); return Array.isArray(data) ? data : []; }
export async function confirmOrderByTicket(ticket: string): Promise<StoreOrder> { const res = await request(`/cart/orders/${encodeURIComponent(ticket.trim().toUpperCase())}/confirm`, { method: 'PATCH' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible confirmar el pedido'); return data; }
export async function getAdminOrderByTicket(ticket: string): Promise<StoreOrder> { const res = await request(`/cart/orders/${encodeURIComponent(ticket.trim().toUpperCase())}/admin`); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No encontramos un pedido con ese ticket'); return data; }
export async function updateOrderTracking(ticket: string, update: { status: string; estimatedDeliveryDate: string | null }): Promise<StoreOrder> { const res = await request(`/cart/orders/${encodeURIComponent(ticket.trim().toUpperCase())}/tracking`, { method: 'PATCH', body: JSON.stringify(update) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible actualizar el seguimiento'); return data; }
export async function getProductReviewSummaries(): Promise<Record<string, ProductReviewSummary>> { const res = await request('/catalog/reviews/summary'); if (!res.ok) throw new Error('No fue posible cargar las calificaciones'); const rows = await res.json().catch(() => []); return Array.isArray(rows) ? Object.fromEntries(rows.map((row: ProductReviewSummary) => [row.productId, row])) : {}; }
export async function getProductReviews(productId: string): Promise<ProductReview[]> { const res = await request(`/catalog/reviews/products/${encodeURIComponent(productId)}`); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible cargar las reseñas'); return Array.isArray(data) ? data : []; }
export async function submitProductReview(productId: string, review: { rating: number; title: string; comment: string }): Promise<{ id: string; status: string; createdAt: string }> { const res = await request(`/catalog/reviews/products/${encodeURIComponent(productId)}`, { method: 'POST', body: JSON.stringify(review) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible guardar la reseña'); return data; }
export async function getAdminProductReviews(status: string): Promise<ProductReview[]> { const res = await request(`/catalog/reviews/admin?status=${encodeURIComponent(status)}&limit=100`); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible cargar las reseñas'); return Array.isArray(data) ? data : []; }
export async function moderateProductReview(id: string, status: 'APPROVED' | 'REJECTED'): Promise<ProductReview> { const res = await request(`/catalog/reviews/admin/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible moderar la reseña'); return data; }
export async function addCartItem(product: { id: string; name: string; price: number; image?: string; position?: string }, quantity = 1) { const res = await request('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, name: product.name, price: product.price, image: product.image, position: product.position, quantity }) }); if (!res.ok) throw new Error('No fue posible agregar el producto. IntÃ©ntalo de nuevo.'); return res.json(); }
export async function updateCartItem(productId: string, quantity: number) { const res = await request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }); if (!res.ok) throw new Error('No fue posible actualizar el carrito. IntÃ©ntalo de nuevo.'); return res.json(); }
export async function deleteCartItem(productId: string) { const res = await request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }); if (!res.ok) throw new Error('No fue posible eliminar el producto. IntÃ©ntalo de nuevo.'); return res.json(); }
