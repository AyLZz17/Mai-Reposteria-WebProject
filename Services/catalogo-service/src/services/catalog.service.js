const db = require('../db');
const cache = require('../cache');

/**
 * Servicio de negocio para el catálogo con soporte de caché en Redis.
 */
class CatalogService {
  async ensureStorefrontSchema() {
    // La imagen del proyecto monta el esquema solo al crear el volumen por primera vez.
    // Estas sentencias permiten actualizar instalaciones existentes sin perder datos.
    await db.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS display_colors TEXT[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS image_position VARCHAR(50) NOT NULL DEFAULT '50% 50%'
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS storefront_settings (
        id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        hero_title VARCHAR(150) NOT NULL DEFAULT 'New Product',
        hero_background_url TEXT NOT NULL DEFAULT '/images/banner/Diseño sin título.svg',
        hero_logo_url TEXT NOT NULL DEFAULT '/images/brand/logo.svg',
        hero_overlay_color VARCHAR(30) NOT NULL DEFAULT '#d9bcae',
        hero_title_color VARCHAR(30) NOT NULL DEFAULT '#f5eee7',
        card_button_label VARCHAR(80) NOT NULL DEFAULT 'ADD TO CART',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query('INSERT INTO storefront_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING');
  }

  async getStorefront() {
    const settingsResult = await db.query('SELECT * FROM storefront_settings WHERE id = 1');
    const products = await this.getAllProducts({ is_active: true, is_featured: true, limit: 4 });
    return { settings: settingsResult.rows[0], products };
  }

  async updateStorefront(fields) {
    const allowed = [
      'hero_title',
      'hero_background_url',
      'hero_logo_url',
      'hero_overlay_color',
      'hero_title_color',
      'card_button_label',
    ];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        values.push(fields[key]);
        updates.push(`${key} = $${values.length}`);
      }
    }
    if (!updates.length) {
      const result = await db.query('SELECT * FROM storefront_settings WHERE id = 1');
      return result.rows[0];
    }
    values.push(1);
    const result = await db.query(
      `UPDATE storefront_settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  // ============================================
  // CATEGORÍAS
  // ============================================

  async getAllCategories(includeInactive = false) {
    const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
    const cached = await cache.getCached(cacheKey);
    if (cached) return cached;

    const query = includeInactive
      ? 'SELECT * FROM categories ORDER BY name ASC'
      : 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC';
    const result = await db.query(query);

    await cache.setCached(cacheKey, result.rows, 300); // 5 min
    return result.rows;
  }

  async getCategoryById(id) {
    const cacheKey = `category:${id}`;
    const cached = await cache.getCached(cacheKey);
    if (cached) return cached;

    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    const category = result.rows[0] || null;

    if (category) await cache.setCached(cacheKey, category, 300);
    return category;
  }

  async createCategory({ name, slug, description, image_url }) {
    const query = `
      INSERT INTO categories (name, slug, description, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [name, slug, description || null, image_url || null]);
    await cache.invalidatePattern('categories:*');
    return result.rows[0];
  }

  async updateCategory(id, fields) {
    const allowed = ['name', 'slug', 'description', 'image_url', 'is_active'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) { values.push(fields[key]); updates.push(`${key} = $${values.length}`); }
    }
    if (!updates.length) return this.getCategoryById(id);
    values.push(id);
    const result = await db.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    const category = result.rows[0] || null;
    await cache.invalidatePattern('categories:*');
    await cache.invalidatePattern(`category:${id}`);
    return category;
  }

  async deleteCategory(id) {
    return this.updateCategory(id, { is_active: false });
  }

  async permanentlyDeleteCategory(id) {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return null;
    await cache.invalidatePattern('categories:*');
    await cache.invalidatePattern('products:*');
    await cache.invalidatePattern(`category:${id}`);
    return result.rows[0];
  }

  // ============================================
  // PRODUCTOS
  // ============================================

  async getAllProducts({ category_id, is_active = true, is_featured, limit = 50, offset = 0 } = {}) {
    const cacheKey = `products:${category_id || 'all'}:${is_active}:${is_featured ?? 'all'}:${limit}:${offset}`;
    const cached = await cache.getCached(cacheKey);
    if (cached) return cached;

    const values = [];
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    if (is_active !== null && is_active !== undefined) {
      values.push(is_active);
      query += ` AND p.is_active = $${values.length}`;
    }

    if (category_id) {
      values.push(category_id);
      query += ` AND p.category_id = $${values.length}`;
    }

    if (is_featured !== undefined && is_featured !== null) {
      values.push(is_featured);
      query += ` AND p.is_featured = $${values.length}`;
    }

    values.push(limit);
    query += ` ORDER BY p.display_order ASC, p.created_at DESC LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await db.query(query, values);
    await cache.setCached(cacheKey, result.rows, 120); // 2 min
    return result.rows;
  }

  async getProductById(id) {
    const cacheKey = `product:id:${id}`;
    const cached = await cache.getCached(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);
    if (!result.rows[0]) return null;

    const product = result.rows[0];

    // Obtener personalizaciones si existen
    const customQuery = 'SELECT * FROM product_customizations WHERE product_id = $1';
    const customResult = await db.query(customQuery, [id]);
    product.customizations = customResult.rows;

    await cache.setCached(cacheKey, product, 180);
    return product;
  }

  async getProductBySlug(slug) {
    const cacheKey = `product:slug:${slug}`;
    const cached = await cache.getCached(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1
    `;
    const result = await db.query(query, [slug]);
    if (!result.rows[0]) return null;

    const product = result.rows[0];
    const customQuery = 'SELECT * FROM product_customizations WHERE product_id = $1';
    const customResult = await db.query(customQuery, [product.id]);
    product.customizations = customResult.rows;

    await cache.setCached(cacheKey, product, 180);
    return product;
  }

  async createProduct({
    category_id,
    name,
    slug,
    description,
    price,
    stock = 0,
    main_image_url,
    images = [],
    is_customizable = false,
    is_featured = false,
    display_order = 0,
    display_colors = [],
    image_position = '50% 50%',
  }) {
    const query = `
      INSERT INTO products (
        category_id, name, slug, description, price, stock,
        main_image_url, images, is_customizable,
        is_featured, display_order, display_colors, image_position
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      category_id || null,
      name,
      slug,
      description || null,
      price,
      stock,
      main_image_url || null,
      images,
      is_customizable,
      is_featured,
      display_order,
      display_colors,
      image_position,
    ];
    const result = await db.query(query, values);
    await cache.invalidatePattern('products:*');
    return result.rows[0];
  }

  async updateProduct(id, fields) {
    const allowed = [
      'category_id',
      'name',
      'slug',
      'description',
      'price',
      'stock',
      'main_image_url',
      'images',
      'is_customizable',
      'is_featured',
      'display_order',
      'display_colors',
      'image_position',
      'is_active',
    ];

    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        values.push(fields[key]);
        updates.push(`${key} = $${values.length}`);
      }
    }

    if (updates.length === 0) return this.getProductById(id);

    values.push(id);
    const query = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const updated = result.rows[0] || null;

    // Invalidar cachés
    await cache.invalidatePattern('products:*');
    await cache.invalidatePattern(`product:id:${id}`);
    if (updated?.slug) await cache.invalidatePattern(`product:slug:${updated.slug}`);

    return updated;
  }

  async deleteProduct(id) {
    return this.updateProduct(id, { is_active: false });
  }

  async permanentlyDeleteProduct(id) {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return null;
    await cache.invalidatePattern('products:*');
    await cache.invalidatePattern(`product:id:${id}`);
    return result.rows[0];
  }

  async addCustomization(productId, { name, options, required = false }) {
    const query = `
      INSERT INTO product_customizations (product_id, name, options, required)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [
      productId,
      name,
      JSON.stringify(options || []),
      required,
    ]);

    await cache.invalidatePattern(`product:id:${productId}`);
    return result.rows[0];
  }
}

module.exports = new CatalogService();
