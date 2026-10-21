const express = require('express');
const { getCart, addItem, updateItem, deleteItem } = require('../services/cart.service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'cart-service' }));

router.use('/api/cart', requireAuth);

router.get('/api/cart', async (req, res) => {
  try {
    const cart = await getCart(req.auth.userId);
    res.json(cart || { items: [], totalItems: 0, subtotal: 0, total: 0 });
  } catch (error) { console.error(`No se pudo leer el carrito: ${error.message}`); res.status(500).json({ error: 'Could not read cart' }); }
});

router.post('/api/cart/items', async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;
    if (!productId || !name || typeof price !== 'number' || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'productId, name, price y quantity son inválidos' });
    res.status(201).json(await addItem({ userId: req.auth.userId, productId, name, price, quantity }));
  } catch (error) { console.error(`No se pudo guardar el producto: ${error.message}`); res.status(500).json({ error: 'Could not save cart item' }); }
});

router.patch('/api/cart/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'quantity debe ser un entero mayor que cero' });
    const result = await updateItem({ userId: req.auth.userId, productId: req.params.productId, quantity });
    if (result === null) return res.status(404).json({ error: 'Cart not found' });
    if (result === undefined) return res.status(404).json({ error: 'Product not found in cart' });
    res.json(result);
  } catch (error) { console.error(`No se pudo actualizar el producto: ${error.message}`); res.status(500).json({ error: 'Could not update cart item' }); }
});

router.delete('/api/cart/items/:productId', async (req, res) => {
  try {
    const result = await deleteItem({ userId: req.auth.userId, productId: req.params.productId });
    if (result === null) return res.status(404).json({ error: 'Cart not found' });
    if (result === undefined) return res.status(404).json({ error: 'Product not found in cart' });
    res.json(result);
  } catch (error) { console.error(`No se pudo eliminar el producto: ${error.message}`); res.status(500).json({ error: 'Could not delete cart item' }); }
});

module.exports = router;
