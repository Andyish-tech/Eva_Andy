const { executeQuery, executeTransaction } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get user's cart
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get or create cart for user
    let cart = await executeQuery('SELECT id FROM carts WHERE user_id = ?', [userId]);
    
    if (cart.length === 0) {
      // Create new cart
      const result = await executeQuery('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cart = [{ id: result.insertId }];
    }

    // Get cart items with product details
    const query = `
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.sku,
        p.stock_quantity,
        p.image_url,
        p.is_active,
        c.name as category_name,
        (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      WHERE c.user_id = ? AND p.is_active = true
      ORDER BY ci.created_at DESC
    `;

    const cartItems = await executeQuery(query, [userId]);

    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        cart_id: cart[0].id,
        items: cartItems,
        summary: {
          total_items: totalItems,
          total_amount: parseFloat(totalAmount.toFixed(2))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add item to cart
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Check if product exists and is active
    const product = await executeQuery(
      'SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?',
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    if (!product[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
        error: 'PRODUCT_NOT_AVAILABLE'
      });
    }

    // Check stock availability
    if (product[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        error: 'INSUFFICIENT_STOCK',
        available_stock: product[0].stock_quantity
      });
    }

    // Get or create cart for user
    let cart = await executeQuery('SELECT id FROM carts WHERE user_id = ?', [userId]);
    
    if (cart.length === 0) {
      const result = await executeQuery('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cart = [{ id: result.insertId }];
    }

    const cartId = cart[0].id;

    // Check if item already exists in cart
    const existingItem = await executeQuery(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product_id]
    );

    if (existingItem.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem[0].quantity + quantity;
      
      // Check stock again for updated quantity
      if (product[0].stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for requested quantity',
          error: 'INSUFFICIENT_STOCK',
          available_stock: product[0].stock_quantity,
          requested_quantity: newQuantity
        });
      }

      await executeQuery(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItem[0].id]
      );

      const updatedItem = await executeQuery(
        'SELECT *, (quantity * (SELECT price FROM products WHERE id = ?)) as subtotal FROM cart_items WHERE id = ?',
        [product_id, existingItem[0].id]
      );

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          cart_item: updatedItem[0],
          action: 'updated'
        }
      });
    } else {
      // Add new item to cart
      const result = await executeQuery(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, product_id, quantity]
      );

      const newItem = await executeQuery(
        `SELECT 
          ci.id as cart_item_id,
          ci.quantity,
          p.id as product_id,
          p.name,
          p.price,
          p.image_url,
          (ci.quantity * p.price) as subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: {
          cart_item: newItem[0],
          action: 'added'
        }
      });
    }

  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
        error: 'INVALID_QUANTITY'
      });
    }

    // Get cart and item
    const query = `
      SELECT ci.id, ci.quantity, ci.product_id, p.stock_quantity, p.is_active
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = ? AND ci.product_id = ?
    `;

    const cartItem = await executeQuery(query, [userId, product_id]);

    if (cartItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'CART_ITEM_NOT_FOUND'
      });
    }

    if (!cartItem[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
        error: 'PRODUCT_NOT_AVAILABLE'
      });
    }

    // Check stock availability
    if (cartItem[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        error: 'INSUFFICIENT_STOCK',
        available_stock: cartItem[0].stock_quantity
      });
    }

    // Update quantity
    await executeQuery(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, cartItem[0].id]
    );

    // Get updated item
    const updatedItem = await executeQuery(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ?`,
      [cartItem[0].id]
    );

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart_item: updatedItem[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;

    // Delete cart item
    const query = `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ? AND ci.product_id = ?
    `;

    const result = await executeQuery(query, [userId, product_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'CART_ITEM_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Clear entire cart
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all cart items for user
    const query = `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ?
    `;

    const result = await executeQuery(query, [userId]);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items_removed: result.affectedRows
      }
    });

  } catch (error) {
    next(error);
  }
};

// Validate cart (check stock availability before checkout)
const validateCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.stock_quantity,
        p.is_active,
        (p.stock_quantity - ci.quantity) as available_after_order
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = ?
    `;

    const cartItems = await executeQuery(query, [userId]);

    const issues = [];
    let isValid = true;

    for (const item of cartItems) {
      if (!item.is_active) {
        issues.push({
          product_id: item.product_id,
          product_name: item.name,
          issue: 'Product not available',
          severity: 'error'
        });
        isValid = false;
      }

      if (item.stock_quantity < item.quantity) {
        issues.push({
          product_id: item.product_id,
          product_name: item.name,
          issue: 'Insufficient stock',
          requested_quantity: item.quantity,
          available_quantity: item.stock_quantity,
          severity: 'error'
        });
        isValid = false;
      }

      if (item.available_after_order < item.stock_quantity * 0.1) {
        issues.push({
          product_id: item.product_id,
          product_name: item.name,
          issue: 'Low stock warning',
          available_after_order: item.available_after_order,
          severity: 'warning'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        is_valid: isValid,
        items: cartItems,
        issues: issues
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
};
