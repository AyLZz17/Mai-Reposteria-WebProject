const CATALOG_SERVICE_URL = (process.env.CATALOG_SERVICE_URL || 'http://catalog-service:8082/api/v1').replace(/\/$/, '');

async function getProduct(productId) {
  let response;
  try {
    response = await fetch(`${CATALOG_SERVICE_URL}/catalog/products/${encodeURIComponent(productId)}`, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    const error = new Error('No se pudo validar el catálogo. Intenta de nuevo en un momento.');
    error.status = 503;
    throw error;
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    const error = new Error('No se pudo validar el catálogo. Intenta de nuevo en un momento.');
    error.status = 503;
    throw error;
  }
  return response.json();
}

module.exports = { getProduct };
