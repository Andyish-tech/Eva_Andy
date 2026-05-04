const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get all products with search and filtering
const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category_id,
      min_price,
      max_price,
      min_rating,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.is_active = true'];
    let params = [];

    // Search query
    if (q) {
      whereConditions.push('(MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) OR p.name LIKE ?)');
      params.push(q, `%${q}%`);
    }

    // Category filter
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    // Price range filter
    if (min_price) {
      whereConditions.push('p.price >= ?');
      params.push(min_price);
    }
    if (max_price) {
      whereConditions.push('p.price <= ?');
      params.push(max_price);
    }

    // Rating filter
    if (min_rating) {
      whereConditions.push('COALESCE(avg_rating, 0) >= ?');
      params.push(min_rating);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort field
    const validSortFields = ['name', 'price', 'created_at', 'rating', 'stock_quantity'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Main query
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        c.name as category_name,
        p.sku,
        p.stock_quantity,
        p.image_url,
        p.created_at,
        p.updated_at,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${sortField === 'rating' ? 'avg_rating' : `p.${sortField}`} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    const products = await executeQuery(query, [...params, parseInt(limit), offset]);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        c.name as category_name,
        p.sku,
        p.stock_quantity,
        p.min_stock_level,
        p.image_url,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      WHERE p.id = ? AND p.is_active = true
      GROUP BY p.id
    `;

    const products = await executeQuery(query, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Get product reviews
    const reviewsQuery = `
      SELECT 
        pr.id,
        pr.rating,
        pr.review,
        pr.created_at,
        u.first_name,
        u.last_name
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ?
      ORDER BY pr.created_at DESC
    `;

    const reviews = await executeQuery(reviewsQuery, [id]);

    const product = {
      ...products[0],
      reviews
    };

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    next(error);
  }
};

// Create new product (admin only)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      sku,
      stock_quantity = 0,
      min_stock_level = 5,
      image_url,
      is_active = true
    } = req.body;

    // Check if category exists
    const category = await executeQuery('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    // Check if SKU already exists
    const existingSku = await executeQuery('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existingSku.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Product with this SKU already exists',
        error: 'SKU_EXISTS'
      });
    }

    // Create product
    const result = await executeQuery(
      `INSERT INTO products (name, description, price, category_id, sku, stock_quantity, min_stock_level, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category_id, sku, stock_quantity, min_stock_level, image_url, is_active]
    );

    // Get created product
    const newProduct = await executeQuery(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: newProduct[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if product exists
    const existingProduct = await executeQuery('SELECT id FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // If updating category, check if it exists
    if (updateFields.category_id) {
      const category = await executeQuery('SELECT id FROM categories WHERE id = ?', [updateFields.category_id]);
      if (category.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
          error: 'CATEGORY_NOT_FOUND'
        });
      }
    }

    // If updating SKU, check if it already exists (excluding current product)
    if (updateFields.sku) {
      const existingSku = await executeQuery('SELECT id FROM products WHERE sku = ? AND id != ?', [updateFields.sku, id]);
      if (existingSku.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists',
          error: 'SKU_EXISTS'
        });
      }
    }

    // Build dynamic update query
    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(id);

    await executeQuery(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get updated product
    const updatedProduct = await executeQuery(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await executeQuery('SELECT id FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check if product is referenced in orders
    const orderReferences = await executeQuery(
      'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
      [id]
    );

    if (orderReferences[0].count > 0) {
      // Soft delete - mark as inactive instead of deleting
      await executeQuery('UPDATE products SET is_active = false WHERE id = ?', [id]);
      
      return res.status(200).json({
        success: true,
        message: 'Product deactivated (has order references)',
        data: {
          deleted: false,
          deactivated: true
        }
      });
    }

    // Hard delete if no references
    await executeQuery('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deleted: true,
        deactivated: false
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get low stock products (admin only)
const getLowStockProducts = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.min_stock_level,
        p.category_id,
        c.name as category_name,
        (p.min_stock_level - p.stock_quantity) as shortage
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.min_stock_level AND p.is_active = true
      ORDER BY shortage DESC
    `;

    const products = await executeQuery(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};
