const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Client } = require('pg');

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080/api/v1';
const origin = process.env.TEST_FRONTEND_ORIGIN || 'http://localhost:3000';
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
const credentials = {
  email: `catalog-qa-${suffix}@mai.local`,
  password: `Qa-${crypto.randomBytes(18).toString('base64url')}A1`,
  firstName: 'Catalog',
  lastName: 'QA',
};

let userId;
let token;
let categoryId;
let productId;

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

async function database() {
  const client = new Client({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT || 5433),
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'change-this-password',
    database: process.env.TEST_DB_NAME || 'mai_users_service',
  });
  await client.connect();
  return client;
}

async function cleanup() {
  const catalogClient = new Client({
    host: process.env.CATALOG_DB_HOST || 'localhost',
    port: Number(process.env.CATALOG_DB_PORT || 5434),
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'change-this-password',
    database: process.env.CATALOG_DB_NAME || 'mai_catalog_service',
  });

  try {
    await catalogClient.connect();
    if (productId) await catalogClient.query('DELETE FROM products WHERE id = $1', [productId]);
    if (categoryId) await catalogClient.query('DELETE FROM categories WHERE id = $1', [categoryId]);
  } finally {
    await catalogClient.end().catch(() => {});
  }

  if (userId) {
    const client = await database();
    try {
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    } finally {
      await client.end();
    }
  }
}

async function run() {
  const registration = await request('/users/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  assert.equal(registration.response.status, 201, `Registro falló: ${JSON.stringify(registration.body)}`);
  userId = registration.body.id;

  const usersDb = await database();
  try {
    await usersDb.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = 'SUPER_ADMIN'
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId],
    );
  } finally {
    await usersDb.end();
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });
  assert.equal(login.response.status, 200, `Login falló: ${JSON.stringify(login.body)}`);
  assert.ok(login.body.accessToken, 'El login no devolvió accessToken');
  assert.ok(login.body.user.roles.includes('SUPER_ADMIN'), 'La cuenta no recibió SUPER_ADMIN');
  token = login.body.accessToken;

  const cors = await fetch(`${baseUrl}/catalog/categories`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.ok(cors.ok, `Preflight CORS falló con ${cors.status}`);
  assert.equal(cors.headers.get('access-control-allow-origin'), origin, 'CORS no permite el origen del frontend');

  const unauthorized = await fetch(`${baseUrl}/catalog/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Sin auth ${suffix}`, slug: `sin-auth-${suffix}` }),
  });
  assert.equal(unauthorized.status, 401, 'Una escritura sin token no fue rechazada');

  const category = await request('/catalog/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: `QA categoría ${suffix}`,
      slug: `qa-categoria-${suffix}`,
      description: 'Categoría creada por prueba automatizada',
      image_url: 'https://example.com/category.jpg',
    }),
  });
  assert.equal(category.response.status, 201, `Crear categoría falló: ${JSON.stringify(category.body)}`);
  categoryId = category.body.id;

  const categoryUpdate = await request(`/catalog/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify({ description: 'Categoría actualizada por prueba' }),
  });
  assert.equal(categoryUpdate.response.status, 200, 'Actualizar categoría falló');
  assert.equal(categoryUpdate.body.description, 'Categoría actualizada por prueba');

  const product = await request('/catalog/products', {
    method: 'POST',
    body: JSON.stringify({
      category_id: categoryId,
      name: `QA producto ${suffix}`,
      slug: `qa-producto-${suffix}`,
      description: 'Producto creado por prueba automatizada',
      price: 12500,
      stock: 8,
      main_image_url: 'https://example.com/product.jpg',
    }),
  });
  assert.equal(product.response.status, 201, `Crear producto falló: ${JSON.stringify(product.body)}`);
  productId = product.body.id;

  const listed = await request(`/catalog/products?category_id=${categoryId}`);
  assert.equal(listed.response.status, 200, 'Listar productos por categoría falló');
  assert.equal(listed.body.some((item) => item.id === productId), true, 'El producto no aparece en su categoría');

  const productUpdate = await request(`/catalog/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ price: 15000, stock: 12, description: 'Producto actualizado por prueba' }),
  });
  assert.equal(productUpdate.response.status, 200, 'Actualizar producto falló');
  assert.equal(productUpdate.body.price, '15000.00');
  assert.equal(productUpdate.body.stock, 12);

  const productDelete = await request(`/catalog/products/${productId}`, { method: 'DELETE' });
  assert.equal(productDelete.response.status, 200, 'Desactivar producto falló');
  assert.equal(productDelete.body.is_active, false);

  const activeProducts = await request('/catalog/products');
  assert.equal(activeProducts.body.some((item) => item.id === productId), false, 'El producto inactivo aparece en el catálogo público');

  const allProducts = await request('/catalog/products?is_active=all');
  assert.equal(allProducts.body.some((item) => item.id === productId), true, 'El panel no puede recuperar el producto inactivo');

  const categoryDelete = await request(`/catalog/categories/${categoryId}`, { method: 'DELETE' });
  assert.equal(categoryDelete.response.status, 200, 'Desactivar categoría falló');
  assert.equal(categoryDelete.body.is_active, false);

  console.log(`PASS: CRUD de catálogo, autenticación, roles y CORS (${credentials.email})`);
}

run()
  .catch((error) => {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
