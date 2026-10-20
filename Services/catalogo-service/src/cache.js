const { createClient } = require('redis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = createClient({ url: redisUrl });
let isConnected = false;

client.on('error', (err) => {
  isConnected = false;
  logger.warning(`Redis no disponible; utilizando PostgreSQL: ${err.message}`);
});

async function connectToCache() {
  try {
    await client.connect();
    isConnected = true;
    logger.success(`Conectado a Redis en ${redisUrl}`);
  } catch (err) {
    isConnected = false;
    logger.warning(`Redis no disponible; utilizando PostgreSQL: ${err.message}`);
  }
}

async function getCached(key) {
  if (!isConnected) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    return null;
  }
}

async function setCached(key, data, ttlSeconds = 120) {
  if (!isConnected || !data) return;
  try {
    await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
  } catch (err) {
    // Falla silenciosa si Redis se desconecta
  }
}

async function invalidatePattern(pattern) {
  if (!isConnected) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    // Falla silenciosa
  }
}

module.exports = {
  connectToCache,
  getCached,
  setCached,
  invalidatePattern,
};
