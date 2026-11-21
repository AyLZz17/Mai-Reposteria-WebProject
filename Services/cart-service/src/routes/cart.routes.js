const express = require('express');
const { getCart, addItem, updateItem, deleteItem } = require('../services/cart.service');
const { createOrder, getDeliveryFee, getOrderPreview, getOrdersForCustomer, getOrderForAdmin, confirmOrderByTicket, updateOrderTrackingByTicket } = require('../services/order.service');
const { recordOrderConfirmation, recordOrderTrackingUpdate } = require('../services/admin-audit-client');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const logger = require('../logger');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'cart-service' }));

router.get('/api/cart/order-config', (req, res, next) => {
  try { res.json({ deliveryFee: getDeliveryFee(), currency: 'COP' }); }
  catch (error) { res.status(error.status || 500).json({ error: error.message }); }
});

router.get('/api/cart/orders/:ticket/preview', async (req, res, next) => {
  try {
    if (!/^MAI-[A-F0-9]{24}$/.test(req.params.ticket)) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const order = await getOrderPreview(req.params.ticket);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json(order);
  } catch (error) { next(error); }
});

router.use('/api/cart', requireAuth);

router.get('/api/cart/orders/mine', async (req, res, next) => {
  try { res.json(await getOrdersForCustomer(req.auth.userId)); }
  catch (error) { next(error); }
});

router.get('/api/cart/orders/:ticket/admin', requireAdmin, async (req, res, next) => {
  try {
    if (!/^MAI-[A-F0-9]{24}$/.test(req.params.ticket)) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const order = await getOrderForAdmin(req.params.ticket);
    if (!order) return res.status(404).json({ error: 'No encontramos un pedido con ese ticket.' });
    res.json(order);
  } catch (error) { next(error); }
});

router.get('/api/cart', async (req, res) => {
  try {
    const cart = await getCart(req.auth.userId);
    res.json(cart || { items: [], totalItems: 0, subtotal: 0, total: 0 });
  } catch (error) { logger.error('cart_read_failed', { requestId: req.requestId, error: error.message }); res.status(500).json({ error: 'Could not read cart' }); }
});

router.post('/api/cart/orders', async (req, res, next) => {
  try {
    const order = await createOrder({ userId: req.auth.userId, customer: req.body });
    res.status(201).json(order);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    logger.error('order_create_failed', { requestId: req.requestId, error: error.message });
    next(error);
  }
});

router.patch('/api/cart/orders/:ticket/confirm', requireAdmin, async (req, res, next) => {
  try {
    if (!/^MAI-[A-F0-9]{24}$/.test(req.params.ticket)) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const result = await confirmOrderByTicket({ ticket: req.params.ticket, adminUserId: req.auth.userId });
    if (!result) return res.status(404).json({ error: 'No encontramos un pedido con ese ticket.' });
    if (result.changed) {
      try {
        const token = (req.get('authorization') || '').split(' ')[1];
        await recordOrderConfirmation({ accessToken: token, requestId: req.requestId, ticket: result.order.ticket });
      } catch (auditError) {
        logger.warn('order_confirmation_audit_failed', { requestId: req.requestId, ticket: result.order.ticket, error: auditError.message });
      }
    }
    res.json(result.order);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

router.patch('/api/cart/orders/:ticket/tracking', requireAdmin, async (req, res, next) => {
  try {
    if (!/^MAI-[A-F0-9]{24}$/.test(req.params.ticket)) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const result = await updateOrderTrackingByTicket({
      ticket: req.params.ticket,
      status: req.body.status,
      estimatedDeliveryDate: req.body.estimatedDeliveryDate ?? null,
      adminUserId: req.auth.userId,
    });
    if (!result) return res.status(404).json({ error: 'No encontramos un pedido con ese ticket.' });
    if (result.changed) {
      try {
        const token = (req.get('authorization') || '').split(' ')[1];
        await recordOrderTrackingUpdate({ accessToken: token, requestId: req.requestId, ticket: result.order.ticket, status: result.order.status, estimatedDeliveryDate: result.order.estimatedDeliveryDate });
      } catch (auditError) {
        logger.warn('order_tracking_audit_failed', { requestId: req.requestId, ticket: result.order.ticket, error: auditError.message });
      }
    }
    res.json(result.order);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

router.post('/api/cart/items', async (req, res) => {
  try {
    const { productId, name, price, image, position, quantity } = req.body;
    const validImage = image === undefined || (typeof image === 'string' && image.length <= 2048 && !/^\s*javascript:/i.test(image));
    const validPosition = position === undefined || (typeof position === 'string' && /^[\w.%\s-]{1,50}$/.test(position));
    if (!productId || !name || typeof price !== 'number' || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0 || !validImage || !validPosition) return res.status(400).json({ error: 'Los datos del producto no son válidos' });
    res.status(201).json(await addItem({ userId: req.auth.userId, productId, name, price, image, position, quantity }));
  } catch (error) { logger.error('cart_item_save_failed', { requestId: req.requestId, error: error.message }); res.status(500).json({ error: 'Could not save cart item' }); }
});

router.patch('/api/cart/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'quantity debe ser un entero mayor que cero' });
    const result = await updateItem({ userId: req.auth.userId, productId: req.params.productId, quantity });
    if (result === null) return res.status(404).json({ error: 'Cart not found' });
    if (result === undefined) return res.status(404).json({ error: 'Product not found in cart' });
    res.json(result);
  } catch (error) { logger.error('cart_item_update_failed', { requestId: req.requestId, error: error.message }); res.status(500).json({ error: 'Could not update cart item' }); }
});

router.delete('/api/cart/items/:productId', async (req, res) => {
  try {
    const result = await deleteItem({ userId: req.auth.userId, productId: req.params.productId });
    if (result === null) return res.status(404).json({ error: 'Cart not found' });
    if (result === undefined) return res.status(404).json({ error: 'Product not found in cart' });
    res.json(result);
  } catch (error) { logger.error('cart_item_delete_failed', { requestId: req.requestId, error: error.message }); res.status(500).json({ error: 'Could not delete cart item' }); }
});

module.exports = router;
