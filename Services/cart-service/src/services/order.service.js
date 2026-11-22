const crypto = require('node:crypto');
const { getDatabase } = require('../db');
const { invalidateCart } = require('../cache');
const { getProduct } = require('./catalog-client');

const FALLBACK_IMAGE = '/images/products/galletas-chocolate.svg';

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getDeliveryFee() {
  const value = process.env.DELIVERY_FEE_COP ?? '0';
  const fee = Number(value);
  if (!Number.isSafeInteger(fee) || fee < 0) {
    throw httpError(503, 'El valor de domicilio no está configurado correctamente.');
  }
  return fee;
}

function validateCustomer(customer) {
  if (!customer || typeof customer !== 'object') throw httpError(400, 'Completa los datos de entrega.');
  const name = typeof customer.name === 'string' ? customer.name.trim() : '';
  const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
  const fulfillment = customer.fulfillment;
  const address = typeof customer.address === 'string' ? customer.address.trim() : '';
  const neighborhood = typeof customer.neighborhood === 'string' ? customer.neighborhood.trim() : '';
  const instructions = typeof customer.instructions === 'string' ? customer.instructions.trim() : '';

  if (customer.privacyConsent !== true) throw httpError(400, 'Debes autorizar el uso de datos para gestionar el pedido.');
  if (name.length < 3 || name.length > 120) throw httpError(400, 'El nombre debe tener entre 3 y 120 caracteres.');
  if (!/^\+?[0-9\s().-]{7,20}$/.test(phone)) throw httpError(400, 'Escribe un número de contacto válido.');
  if (!['DELIVERY', 'PICKUP'].includes(fulfillment)) throw httpError(400, 'Selecciona domicilio o recogida.');
  if (fulfillment === 'DELIVERY' && (address.length < 5 || address.length > 250)) {
    throw httpError(400, 'Escribe una dirección de entrega válida.');
  }
  if (neighborhood.length > 120 || instructions.length > 500) throw httpError(400, 'Las indicaciones de entrega superan el límite permitido.');

  return {
    name,
    phone,
    fulfillment,
    address: fulfillment === 'DELIVERY' ? address : '',
    neighborhood: fulfillment === 'DELIVERY' ? neighborhood : '',
    instructions,
  };
}

function safeImage(value) {
  if (typeof value !== 'string' || value.length > 4096) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(value) || /^\/images\//.test(value) || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  return FALLBACK_IMAGE;
}

function publicOrder(order) {
  return {
    ticket: order.ticket,
    status: order.status,
    estimatedDeliveryDate: order.estimatedDeliveryDate || null,
    fulfillment: order.customer.fulfillment,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    currency: order.currency,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

async function createOrder({ userId, customer }) {
  const database = getDatabase();
  const cart = await database.collection('carts').findOne({ userId, status: 'active' });
  if (!cart?.items?.length) throw httpError(400, 'Tu carrito está vacío. Agrega productos antes de continuar.');

  const orders = database.collection('orders');
  const existing = await orders.findOne({ cartId: cart._id });
  if (existing) {
    await database.collection('carts').updateOne({ _id: cart._id, status: 'active' }, { $set: { status: 'ordered', updatedAt: new Date() } });
    await invalidateCart(userId);
    return publicOrder(existing);
  }

  const validatedCustomer = validateCustomer(customer);
  if (cart.items.length > 50) throw httpError(400, 'El pedido supera el máximo de 50 productos distintos.');

  const products = await Promise.all(cart.items.map((item) => getProduct(item.productId)));
  const items = cart.items.map((cartItem, index) => {
    const product = products[index];
    if (!product || product.is_active !== true) throw httpError(409, `El producto "${cartItem.name}" ya no está disponible.`);
    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > 100) {
      throw httpError(400, `La cantidad de "${cartItem.name}" no es válida.`);
    }
    if (Number.isInteger(product.stock) && product.stock < cartItem.quantity) {
      throw httpError(409, `No hay unidades suficientes de "${product.name}" para completar el pedido.`);
    }
    const unitPrice = Math.round(Number(product.price));
    if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) throw httpError(503, 'El precio de un producto no se pudo validar.');
    return {
      productId: String(product.id),
      name: String(product.name).slice(0, 150),
      quantity: cartItem.quantity,
      unitPrice,
      subtotal: unitPrice * cartItem.quantity,
      image: safeImage(cartItem.image || product.main_image_url),
      position: typeof cartItem.position === 'string' ? cartItem.position.slice(0, 50) : '50% 50%',
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = validatedCustomer.fulfillment === 'DELIVERY' ? getDeliveryFee() : 0;
  const total = subtotal + deliveryFee;
  if (!Number.isSafeInteger(total)) throw httpError(400, 'El total del pedido supera el valor permitido.');

  const now = new Date();
  const order = {
    schemaVersion: 1,
    ticket: `MAI-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    cartId: cart._id,
    userId,
    status: 'PENDING_CONFIRMATION',
    customer: validatedCustomer,
    privacyConsentAt: now,
    items,
    subtotal,
    deliveryFee,
    total,
    currency: 'COP',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await orders.insertOne(order);
  } catch (error) {
    if (error.code !== 11000) throw error;
    const concurrentOrder = await orders.findOne({ cartId: cart._id });
    if (concurrentOrder) {
      await database.collection('carts').updateOne({ _id: cart._id, status: 'active' }, { $set: { status: 'ordered', updatedAt: new Date() } });
      await invalidateCart(userId);
      return publicOrder(concurrentOrder);
    }
    throw error;
  }

  await database.collection('carts').updateOne({ _id: cart._id, status: 'active' }, { $set: { status: 'ordered', updatedAt: now } });
  await invalidateCart(userId);
  return publicOrder(order);
}

async function getOrderPreview(ticket) {
  const order = await getDatabase().collection('orders').findOne({ ticket });
  return order ? publicOrder(order) : null;
}

async function getOrdersForCustomer(userId) {
  const orders = await getDatabase().collection('orders')
    .find({ userId }, { projection: { _id: 0, ticket: 1, status: 1, 'customer.fulfillment': 1, items: 1, subtotal: 1, deliveryFee: 1, total: 1, currency: 1, createdAt: 1, updatedAt: 1, estimatedDeliveryDate: 1 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return orders.map(publicOrder);
}

async function getOrderForAdmin(ticket) {
  const order = await getDatabase().collection('orders').findOne({ ticket });
  return order ? { ...publicOrder(order), customer: order.customer, confirmedAt: order.confirmedAt } : null;
}

async function confirmOrderByTicket({ ticket, adminUserId }) {
  const orders = getDatabase().collection('orders');
  const order = await orders.findOne({ ticket });
  if (!order) return null;
  if (order.status === 'CONFIRMED') return { order: { ...publicOrder(order), customer: order.customer, confirmedAt: order.confirmedAt }, changed: false };
  if (order.status !== 'PENDING_CONFIRMATION') throw httpError(409, 'El pedido ya no está pendiente de confirmación.');

  const confirmedAt = new Date();
  const result = await orders.updateOne(
    { _id: order._id, status: 'PENDING_CONFIRMATION' },
    { $set: { status: 'CONFIRMED', confirmedAt, confirmedBy: adminUserId, updatedAt: confirmedAt } },
  );
  const current = await orders.findOne({ _id: order._id });
  if (!current) return null;
  if (result.modifiedCount === 0 && current.status !== 'CONFIRMED') {
    throw httpError(409, 'Otro administrador cambió el estado de este pedido. Actualiza e inténtalo de nuevo.');
  }
  return { order: { ...publicOrder(current), customer: current.customer, confirmedAt: current.confirmedAt }, changed: result.modifiedCount > 0 };
}

const ORDER_STATUSES = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

async function updateOrderTrackingByTicket({ ticket, status, estimatedDeliveryDate, adminUserId }) {
  if (!ORDER_STATUSES.includes(status)) throw httpError(400, 'Selecciona un estado de pedido válido.');
  if (estimatedDeliveryDate !== null && estimatedDeliveryDate !== undefined &&
      (typeof estimatedDeliveryDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(estimatedDeliveryDate) ||
       Number.isNaN(Date.parse(`${estimatedDeliveryDate}T00:00:00Z`)) || new Date(`${estimatedDeliveryDate}T00:00:00Z`).toISOString().slice(0, 10) !== estimatedDeliveryDate)) {
    throw httpError(400, 'La fecha estimada debe ser una fecha válida en formato AAAA-MM-DD.');
  }

  const orders = getDatabase().collection('orders');
  const existingOrder = await orders.findOne({ ticket });
  if (!existingOrder) return null;
  const now = new Date();
  const fields = { status, estimatedDeliveryDate: estimatedDeliveryDate || null, updatedAt: now, lastUpdatedBy: adminUserId };
  if (status === 'CONFIRMED' && !existingOrder.confirmedAt) {
    fields.confirmedAt = now;
    fields.confirmedBy = adminUserId;
  }
  const result = await orders.updateOne(
    { _id: existingOrder._id, updatedAt: existingOrder.updatedAt },
    { $set: fields },
  );
  if (result.matchedCount === 0) throw httpError(409, 'Otro administrador actualizó este pedido. Vuelve a consultarlo e inténtalo de nuevo.');
  const order = await orders.findOne({ _id: existingOrder._id });
  return { order: { ...publicOrder(order), customer: order.customer, confirmedAt: order.confirmedAt }, changed: result.modifiedCount > 0 };
}

module.exports = { createOrder, getDeliveryFee, getOrderPreview, getOrdersForCustomer, getOrderForAdmin, confirmOrderByTicket, updateOrderTrackingByTicket, ORDER_STATUSES };
