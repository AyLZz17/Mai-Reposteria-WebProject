require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectToDatabase } = require('./db');
const { connectToCache } = require('./cache');
const cartRoutes = require('./routes/cart.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(cartRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await connectToDatabase();
    await connectToCache();
    app.listen(PORT, () => {
      console.log(`Cart service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not start cart service:', error.message);
    process.exit(1);
  }
}

if (require.main === module) startServer();

module.exports = { app, startServer };
