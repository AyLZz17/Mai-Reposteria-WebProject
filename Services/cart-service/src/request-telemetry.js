const { randomUUID } = require('node:crypto');
const logger = require('./logger');

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;

function requestTelemetry(req, res, next) {
  const incomingId = req.get('x-request-id');
  req.requestId = incomingId && REQUEST_ID_PATTERN.test(incomingId) ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    if (req.path === '/health' || req.path === '/api/v1/cart/health') return;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = req.route?.path || '/unmatched';
    logger.info('http_request', {
      channel: 'HTTP',
      requestId: req.requestId,
      method: req.method,
      route,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  next();
}

module.exports = { requestTelemetry };
