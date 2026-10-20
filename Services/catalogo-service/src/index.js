require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const catalogRoutes = require('./routes/catalog.routes');
const catalogService = require('./services/catalog.service');
const db = require('./db');
const { connectToCache } = require('./cache');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 8082;

// Conectar caché Redis (resiliente, si no está activo sigue con PostgreSQL)
connectToCache();

// Seguridad y Middlewares
app.use(helmet());
if (process.env.ENABLE_CORS !== 'false') {
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
}
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.' },
});
app.use('/api/', limiter);

// Rutas de la API
app.use('/api/v1/catalog', catalogRoutes);

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
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || '[x] Error interno del servidor',
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

  app.listen(PORT, () => {
    logger.success('MAI Repostería - Catálogo Service');
    logger.success(`Servidor ejecutándose en el puerto ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/actuator/health`);
    logger.info(`API Catálogo: http://localhost:${PORT}/api/v1/catalog/products`);
  });
}

start();

module.exports = app;
