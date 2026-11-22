const { randomUUID } = require('node:crypto');
const logger = require('./logger');

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;
const USER_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://users-service:8081';

function actionFor(req) {
  const parts = req.path.split('/').filter(Boolean);
  const resource = parts[0];
  if (resource === 'storefront') return { action: 'UPDATE_STOREFRONT', entityType: 'STOREFRONT', entityId: '1' };
  if (resource !== 'products' && resource !== 'categories') return null;

  const entityType = resource === 'products' ? 'PRODUCT' : 'CATEGORY';
  const verb = req.method === 'POST' ? 'CREATE' : req.method === 'PATCH' ? 'UPDATE' : 'DELETE';
  const permanent = parts.includes('permanent');
  const customization = parts.includes('customizations');
  let action = `${verb}_${entityType}`;
  if (permanent) action = `DELETE_${entityType}_PERMANENT`;
  if (customization) action = 'ADD_PRODUCT_CUSTOMIZATION';

  const entityId = parts[1] && parts[1] !== 'slug' ? parts[1] : null;
  return { action, entityType, entityId };
}

function safeSummary(req, action, statusCode) {
  const name = typeof req.body?.name === 'string'
    ? req.body.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 80)
    : '';
  const outcome = statusCode < 400 ? 'SUCCESS' : 'FAILURE';
  const labels = {
    CREATE_PRODUCT: 'Creó un producto',
    UPDATE_PRODUCT: 'Actualizó un producto',
    DELETE_PRODUCT: 'Desactivó un producto',
    DELETE_PRODUCT_PERMANENT: 'Eliminó un producto definitivamente',
    ADD_PRODUCT_CUSTOMIZATION: 'Agregó una personalización a un producto',
    CREATE_CATEGORY: 'Creó una categoría',
    UPDATE_CATEGORY: 'Actualizó una categoría',
    DELETE_CATEGORY: 'Desactivó una categoría',
    DELETE_CATEGORY_PERMANENT: 'Eliminó una categoría definitivamente',
    UPDATE_STOREFRONT: 'Actualizó la configuración de portada',
  };
  const verb = labels[action] || 'Modificó datos del catálogo';
  const summary = name && outcome === 'SUCCESS' ? `${verb}: ${name}` : verb;
  return { outcome, summary: outcome === 'SUCCESS' ? summary : `Falló: ${summary} (HTTP ${statusCode})` };
}

async function writeAdminAudit(req, action, entity, outcome, summary) {
  const authorization = req.get('authorization');
  if (!authorization) return;

  const response = await fetch(`${USER_SERVICE_URL}/api/v1/internal/audit`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      'X-Request-Id': req.requestId,
    },
    body: JSON.stringify({ ...action, ...entity, outcome, summary, requestId: req.requestId }),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`Audit service returned HTTP ${response.status}`);
}

function requestTelemetry(req, res, next) {
  const incomingId = req.get('x-request-id');
  req.requestId = incomingId && REQUEST_ID_PATTERN.test(incomingId) ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.baseUrl || '/unmatched';
    logger.info('http_request', {
      channel: 'HTTP',
      requestId: req.requestId,
      method: req.method,
      route,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });

    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const adminAction = req.path && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))
      ? actionFor(req)
      : null;
    if (!adminAction) return;

    const { outcome, summary } = safeSummary(req, adminAction.action, res.statusCode);
    void writeAdminAudit(req, adminAction, { entityId: adminAction.entityId }, outcome, summary)
      .catch((error) => logger.error('admin_audit_write_failed', {
        channel: 'AUDIT',
        requestId: req.requestId,
        action: adminAction.action,
        actor: typeof req.user?.sub === 'string' ? req.user.sub : 'unknown',
        error: error.message,
      }));
  });
  next();
}

module.exports = { requestTelemetry };
