const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = createClient({ url: redisUrl });
let enabled = false;

client.on('error', (error) => {
  enabled = false;
  console.warn('Redis unavailable; using MongoDB only:', error.message);
});

async function connectToCache() {
  try {
    await client.connect();
    enabled = true;
    console.log(`Connected to Redis at ${redisUrl}`);
  } catch (error) {
    enabled = false;
    console.warn('Redis unavailable; using MongoDB only:', error.message);
  }
}

async function getCachedCart(userId) {
  if (!enabled) return null;
  const value = await client.get(`cart:${userId}`);
  return value ? JSON.parse(value) : null;
}

async function cacheCart(userId, cart) {
  if (!enabled || !cart) return;
  await client.set(`cart:${userId}`, JSON.stringify(cart), { EX: 60 });
}

async function invalidateCart(userId) {
  if (enabled) await client.del(`cart:${userId}`);
}

module.exports = { connectToCache, getCachedCart, cacheCart, invalidateCart };
