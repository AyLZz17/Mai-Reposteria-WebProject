const { getDatabase } = require('../db');
const { getCachedCart, cacheCart, invalidateCart } = require('../cache');

async function getCart(userId) {
  const cachedCart = await getCachedCart(userId);
  if (cachedCart) return cachedCart;
  const cart = await findCart(userId);
  await cacheCart(userId, cart);
  return cart;
}

async function findCart(userId) {
  return getDatabase().collection('carts').findOne({ userId, status: 'active' });
}

async function addItem({ userId, productId, name, price, quantity }) {
  const collection = getDatabase().collection('carts');
  const now = new Date();
  const cart = await findCart(userId);
  const newItem = { productId, name, quantity, unitPrice: price, subtotal: price * quantity, addedAt: now };

  if (!cart) {
    const newCart = { userId, items: [newItem], totalItems: quantity, subtotal: newItem.subtotal, discount: 0, total: newItem.subtotal, currency: 'COP', status: 'active', createdAt: now, updatedAt: now };
    await collection.insertOne(newCart);
    await invalidateCart(userId);
    return newCart;
  }

  const existingItem = cart.items.find((item) => item.productId === productId);
  const items = existingItem
    ? cart.items.map((item) => item.productId !== productId ? item : { ...item, quantity: item.quantity + quantity, subtotal: item.unitPrice * (item.quantity + quantity) })
    : [...cart.items, newItem];
  const totals = calculateTotals(items, cart.discount);
  await collection.updateOne({ _id: cart._id }, { $set: { items, ...totals, updatedAt: now } });
  await invalidateCart(userId);
  return { ...cart, items, ...totals, updatedAt: now };
}

async function updateItem({ userId, productId, quantity }) {
  const collection = getDatabase().collection('carts');
  const cart = await findCart(userId);
  if (!cart) return null;
  const item = cart.items.find((currentItem) => currentItem.productId === productId);
  if (!item) return undefined;
  item.quantity = quantity;
  item.subtotal = item.unitPrice * quantity;
  const totals = calculateTotals(cart.items, cart.discount);
  const updatedAt = new Date();
  await collection.updateOne({ _id: cart._id }, { $set: { items: cart.items, ...totals, updatedAt } });
  await invalidateCart(userId);
  return { ...cart, items: cart.items, ...totals, updatedAt };
}

async function deleteItem({ userId, productId }) {
  const collection = getDatabase().collection('carts');
  const cart = await findCart(userId);
  if (!cart) return null;
  const items = cart.items.filter((item) => item.productId !== productId);
  if (items.length === cart.items.length) return undefined;
  const totals = calculateTotals(items, cart.discount);
  const updatedAt = new Date();
  await collection.updateOne({ _id: cart._id }, { $set: { items, ...totals, updatedAt } });
  await invalidateCart(userId);
  return { ...cart, items, ...totals, updatedAt };
}

function calculateTotals(items, discount = 0) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { totalItems, subtotal, total: subtotal - discount };
}

module.exports = { getCart, addItem, updateItem, deleteItem };
