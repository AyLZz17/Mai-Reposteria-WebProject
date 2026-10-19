const db = require('../db');

/**
 * Servicio de negocio para el catálogo (Categorías y Productos).
 */
class CatalogService {
  // ============================================
  // CATEGORÍAS
  // ============================================

  async getAllCategories(includeInactive = false) {
    const query = includeInactive
      ? 'SELECT * FROM categories ORDER BY name ASC'
      : 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC';
    const result = await db.query(query);
    return result.rows;
  }

  async getCategoryById(id) {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createCategory({ name, slug, description, image_url }) {
    const query = `
      INSERT INTO categories (name, slug, description, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [name, slug, description || null, image_url || null]);
    return result.rows[0];
  }

  // ============================================
  // PRODUCTOS
  // ============================================

  async getAllProducts({ category_id, is_active = true, limit = 50, offset = 0 } = {}) {
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

    values.push(limit);
    query += ` ORDER BY p.created_at DESC LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await db.query(query, values);
    return result.rows;
  }

  async getProductById(id) {
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

    return product;
  }

  async getProductBySlug(slug) {
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
  }) {
    const query = `
      INSERT INTO products (
        category_id, name, slug, description, price, stock,
        main_image_url, images, is_customizable
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    ];
    const result = await db.query(query, values);
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
    return result.rows[0] || null;
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
    return result.rows[0];
  }
}

module.exports = new CatalogService();
