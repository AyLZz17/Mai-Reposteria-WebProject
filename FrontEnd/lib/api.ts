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
export type StorefrontSettings = {
  id: number;
  hero_title: string;
  hero_background_url: string;
  hero_logo_url: string;
  hero_overlay_color: string;
  hero_title_color: string;
  card_button_label: string;
};
export type StorefrontResponse = { settings: StorefrontSettings; products: CatalogProduct[] };

export function getAccessToken() { return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY); }
export function clearAccessToken() { if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY); }

function notifyAuthenticationExpired() {
  clearAccessToken();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mai:auth-expired'));
}

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${getApiUrl()}${path}`, { ...init, headers });
  if (response.status === 401 && token) notifyAuthenticationExpired();
  return response;
}
function mapUser(data: any): User | undefined { if (!data) return undefined; return { id: data.id, email: data.email, name: data.name || [data.firstName, data.lastName].filter(Boolean).join(' '), roles: data.roles || [] }; }

export async function loginApi(email: string, password: string): Promise<LoginResponse> { try { const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) }); const data = await res.json().catch(() => ({})); if (res.ok && data.accessToken && typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, data.accessToken); return { status: res.status, user: mapUser(data.user), accessToken: data.accessToken, refreshToken: data.refreshToken, message: data.message }; } catch { return { status: 503, message: 'Sin conexión con el servidor' }; } }

export async function registerApi(name: string, email: string, password: string): Promise<RegisterResponse> { const parts = name.trim().split(/\s+/); const firstName = parts.shift() || ''; const lastName = parts.join(' ') || firstName; try { const res = await request('/users/register', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password, firstName, lastName }) }); const data = await res.json().catch(() => ({})); return { status: res.status, user: mapUser(data), message: data.message }; } catch { return { status: 503, message: 'Sin conexión con el servidor' }; } }

export async function logoutApi(refreshToken?: string) {
  try { await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } finally { clearAccessToken(); }
}

export async function getCatalogProducts(includeInactive = false): Promise<CatalogProduct[]> { const query = includeInactive ? '?is_active=all' : ''; const res = await request(`/catalog/products${query}`); if (!res.ok) throw new Error('No fue posible cargar el catálogo'); return res.json(); }
export async function getCurrentUser(): Promise<User> { const res = await request('/users/me'); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'Sesión no válida'); return mapUser(data) as User; }
export async function getCatalogCategories(includeInactive = false): Promise<CatalogCategory[]> { const query = includeInactive ? '?include_inactive=true' : ''; const res = await request(`/catalog/categories${query}`); if (!res.ok) throw new Error('No fue posible cargar las categorías'); return res.json(); }
export async function getStorefront(): Promise<StorefrontResponse> { const res = await request('/catalog/storefront'); if (!res.ok) throw new Error('No fue posible cargar la portada'); return res.json(); }
export async function updateStorefront(fields: Partial<Omit<StorefrontSettings, 'id'>>) { const res = await request('/catalog/storefront', { method: 'PATCH', body: JSON.stringify(fields) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible actualizar la portada'); return data as StorefrontSettings; }
export async function createCatalogCategory(category: { name: string; slug: string; description?: string; image_url?: string }) { const res = await request('/catalog/categories', { method: 'POST', body: JSON.stringify(category) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible crear la categoría'); return data; }
export async function updateCatalogCategory(id: string, fields: Partial<CatalogCategory>) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(fields) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible actualizar la categoría'); return data; }
export async function deleteCatalogCategory(id: string) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible eliminar la categoría'); return data; }
export async function permanentlyDeleteCatalogCategory(id: string) { const res = await request(`/catalog/categories/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' }); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'No fue posible eliminar definitivamente la categoría'); } }
export async function createCatalogProduct(product: { category_id?: string; name: string; slug: string; description: string; price: number; stock: number; main_image_url?: string; is_featured?: boolean; display_order?: number; display_colors?: string[]; image_position?: string; }) { const res = await request('/catalog/products', { method: 'POST', body: JSON.stringify({ ...product, is_customizable: false }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible crear el producto'); return data; }
export async function updateCatalogProduct(id: string, fields: Partial<{ category_id: string; name: string; slug: string; description: string; price: number; stock: number; main_image_url: string; is_active: boolean; is_featured: boolean; display_order: number; display_colors: string[]; image_position: string; }>) { const res = await request(`/catalog/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(fields) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible actualizar el producto'); return data; }
export async function deleteCatalogProduct(id: string) { const res = await request(`/catalog/products/${encodeURIComponent(id)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible eliminar el producto'); return data; }
export async function permanentlyDeleteCatalogProduct(id: string) { const res = await request(`/catalog/products/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' }); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'No fue posible eliminar definitivamente el producto'); } }
export async function promoteUserToAdmin(email: string) { const res = await request('/users/admin-role', { method: 'PATCH', body: JSON.stringify({ email }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible asignar el rol de administrador'); return data as User; }
export async function removeUserAdminRole(email: string) { const res = await request(`/users/admin-role?email=${encodeURIComponent(email)}`, { method: 'DELETE' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'No fue posible quitar el rol de administrador'); return data as User; }
export async function getCart() { const res = await request('/cart'); if (!res.ok) throw new Error('No fue posible cargar el carrito'); return res.json(); }
export async function addCartItem(product: { id: string; name: string; price: number }, quantity = 1) { const res = await request('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, name: product.name, price: product.price, quantity }) }); if (!res.ok) throw new Error('No fue posible agregar el producto'); return res.json(); }
export async function updateCartItem(productId: string, quantity: number) { const res = await request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }); if (!res.ok) throw new Error('No fue posible actualizar el carrito'); return res.json(); }
export async function deleteCartItem(productId: string) { const res = await request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }); if (!res.ok) throw new Error('No fue posible eliminar el producto'); return res.json(); }
