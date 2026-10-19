require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const catalogRoutes = require('./routes/catalog.routes');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8082;

// Seguridad y Middlewares
app.use(helmet());
app.use(cors());
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

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('[x] Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || '[x] Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`[+] MAI Repostería - Catálogo Service`);
  console.log(`[+] Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`[+] Health check: http://localhost:${PORT}/actuator/health`);
  console.log(`[+] API Catálogo: http://localhost:${PORT}/api/v1/catalog/products`);
  console.log(`=========================================`);
});

module.exports = app;
