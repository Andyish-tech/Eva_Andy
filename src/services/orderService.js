const { withTransaction, executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class OrderService {
  async checkout(userId, shippingAddress, billingAddress, paymentMethod, notes) {
    return await withTransaction(async (connection) => {
      // 1. Get user's cart items
      const cartQuery = `
        SELECT 
          ci.id as cart_item_id,
          ci.quantity,
          p.id as product_id,
          p.name,
          p.price,
          p.is_active,
          (ci.quantity * p.price) as item_total
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
      `;
      const [cartItems] = await connection.execute(cartQuery, [userId]);

      if (cartItems.length === 0) {
        throw new AppError('Cart is empty', 400, 'EMPTY_CART');
      }

      // 2. Extract product IDs and lock rows using FOR UPDATE to prevent race conditions
      const productIds = cartItems.map(item => item.product_id);
      const placeholders = productIds.map(() => '?').join(',');
      const lockQuery = `
        SELECT id, name, stock_quantity, is_active 
        FROM products 
        WHERE id IN (${placeholders}) 
        FOR UPDATE
      `;
      const [lockedProducts] = await connection.execute(lockQuery, productIds);
      const lockedProductMap = new Map(lockedProducts.map(p => [p.id, p]));

      // 3. Validate stock and product availability against locked data
      for (const item of cartItems) {
        const productData = lockedProductMap.get(item.product_id);

        if (!productData || !productData.is_active) {
          throw new AppError(`Product '${item.name}' is no longer available`, 400, 'PRODUCT_NOT_AVAILABLE');
        }

        if (productData.stock_quantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for product '${item.name}' (Requested: ${item.quantity}, Available: ${productData.stock_quantity})`, 
            400, 
            'INSUFFICIENT_STOCK'
          );
        }
      }

      // 4. Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.item_total), 0);
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // 5. Create order
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, billing_address, notes)
        VALUES (?, ?, 'pending', ?, ?, ?, ?)
      `, [userId, orderNumber, totalAmount, shippingAddress, billingAddress || shippingAddress, notes]);
      const orderId = orderResult.insertId;

      // 6. Create payment record
      await connection.execute(`
        INSERT INTO payments (order_id, payment_method, amount, status)
        VALUES (?, ?, ?, 'pending')
      `, [orderId, paymentMethod, totalAmount]);

      // 7. Add order items and update stock
      for (const item of cartItems) {
        await connection.execute(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?)
        `, [orderId, item.product_id, item.quantity, item.price, item.item_total]);

        await connection.execute(`
          UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
        `, [item.quantity, item.product_id]);
      }

      // 8. Clear cart
      await connection.execute(`
        DELETE ci FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
      `, [userId]);

      return { orderId, orderNumber, totalAmount };
    });
  }

  async getCompleteOrder(orderId) {
    const completeOrder = await executeQuery(
      `SELECT o.*, u.first_name, u.last_name, u.email
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    const orderItems = await executeQuery(
      `SELECT oi.*, p.name, p.sku, p.image_url
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    if (completeOrder.length === 0) return null;

    return {
      ...completeOrder[0],
      items: orderItems
    };
  }
}

module.exports = new OrderService();
