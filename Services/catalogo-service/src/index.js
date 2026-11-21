require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const catalogRoutes = require('./routes/catalog.routes');
const reviewRoutes = require('./routes/reviews.routes');
const catalogService = require('./services/catalog.service');
const reviewService = require('./services/review.service');
const db = require('./db');
const { connectToCache } = require('./cache');
const logger = require('./logger');
const { requestTelemetry } = require('./request-telemetry');

const app = express();
const PORT = process.env.PORT || 8082;

// Conectar caché Redis (resiliente, si no está activo sigue con PostgreSQL)
connectToCache();

// Seguridad y Middlewares
app.use(helmet());
if (process.env.ENABLE_CORS !== 'false') {
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
}
app.use('/api/v1/catalog', requestTelemetry);
// Admin images are sent as data URLs; a 4 MiB file expands to about 5.34 MiB in JSON.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '6mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.' },
});
app.use('/api/', limiter);

// Rutas de la API
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/catalog/reviews', reviewRoutes);

// Health check
app.get('/actuator/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'UP',
      service: 'catalogo-service',
      database: 'PostgreSQL - Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      service: 'catalogo-service',
      database: 'Disconnected',
      error: err.message,
    });
  }
});
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'catalogo-service' }));

// Manejador global de errores
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 413
    ? 'La solicitud supera el límite de tamaño permitido. Reduce la imagen e inténtalo de nuevo.'
    : status < 500
      ? err.message
      : 'Ocurrió un error al guardar los datos. Inténtalo de nuevo.';
  logger.error('request_failed', {
    requestId: req.requestId,
    status,
    errorCode: err.code || err.type || 'INTERNAL_ERROR',
    error: err.message,
  });
  res.status(err.status || 500).json({
    error: message,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

// Inicialización del servidor y migraciones compatibles con instalaciones existentes
async function start() {
  try {
    await catalogService.ensureStorefrontSchema();
  } catch (error) {
    logger.error(`No se pudo preparar la configuración de portada: ${error.message}`);
  }

  try {
    await reviewService.ensureSchema();
  } catch (error) {
    logger.error(`No se pudo preparar el esquema de reseñas: ${error.message}`);
  }

  app.listen(PORT, () => {
    logger.success('MAI Repostería - Catálogo Service');
    logger.success(`Servidor ejecutándose en el puerto ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/actuator/health`);
    logger.info(`API Catálogo: http://localhost:${PORT}/api/v1/catalog/products`);
  });
}

start();

module.exports = app;
