const express = require('express');
const router = express.Router();
const catalogService = require('../services/catalog.service');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// ============================================
// RUTAS DE CATEGORÍAS
// ============================================

// Listar todas las categorías
router.get('/categories', async (req, res, next) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const categories = await catalogService.getAllCategories(includeInactive);
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// Obtener categoría por ID
router.get('/categories/:id', async (req, res, next) => {
  try {
    const category = await catalogService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// Crear una categoría
router.post('/categories', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, slug, description, image_url } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'El nombre y el slug de la categoría son obligatorios' });
    }
    const newCategory = await catalogService.createCategory({ name, slug, description, image_url });
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug' });
    }
    next(err);
  }
});

// ============================================
// RUTAS DE PRODUCTOS
// ============================================

// Listar productos (con filtros opcionales de categoría, estado y paginación)
router.get('/products', async (req, res, next) => {
  try {
    const { category_id, is_active, limit, offset } = req.query;
    const products = await catalogService.getAllProducts({
      category_id,
      is_active: is_active !== undefined ? is_active === 'true' : true,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Obtener producto por slug (para URLs amigables del frontend)
router.get('/products/slug/:slug', async (req, res, next) => {
  try {
    const product = await catalogService.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Obtener producto por ID (UUID)
router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await catalogService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Crear un producto
router.post('/products', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      main_image_url,
      images,
      is_customizable,
    } = req.body;

    if (!name || !slug || price === undefined) {
      return res.status(400).json({ error: 'El nombre, slug y precio son obligatorios' });
    }

    const newProduct = await catalogService.createProduct({
      category_id,
      name,
      slug,
      description,
      price: parseFloat(price),
      stock: stock ? parseInt(stock, 10) : 0,
      main_image_url,
      images,
      is_customizable: Boolean(is_customizable),
    });

    res.status(201).json(newProduct);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug' });
    }
    next(err);
  }
});

// Actualizar un producto
router.patch('/products/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const updated = await catalogService.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Agregar opciones de personalización a un producto
router.post('/products/:id/customizations', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, options, required } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la personalización es obligatorio' });
    }

    const customization = await catalogService.addCustomization(req.params.id, {
      name,
      options,
      required,
    });
    res.status(201).json(customization);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
