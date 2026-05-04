const { executeQuery, executeTransaction } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get user's orders
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = ['o.user_id = ?'];
    let params = [userId];

    // Filter by status
    if (status) {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.billing_address,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count,
        pm.payment_method,
        pm.status as payment_status
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN payments pm ON o.id = pm.order_id
      WHERE ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await executeQuery(query, [...params, parseInt(limit), offset]);

    // Count query for pagination
    const countQuery = `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        orders,
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

// Get single order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get order details
    const orderQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.billing_address,
        o.notes,
        o.created_at,
        o.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        pm.payment_method,
        pm.status as payment_status,
        pm.transaction_id
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments pm ON o.id = pm.order_id
      WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')
    `;

    const orders = await executeQuery(orderQuery, [id, userId, req.user.role]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        p.id as product_id,
        p.name,
        p.sku,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `;

    const items = await executeQuery(itemsQuery, [id]);

    const order = {
      ...orders[0],
      items
    };

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

// Checkout process
const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shipping_address, billing_address, payment_method, notes } = req.body;
    const io = req.app.get('io');
    
    // Import the OrderService here or at the top of the file
    const orderService = require('../services/orderService');

    // Delegate the complex transaction and business logic to OrderService
    const { orderId, orderNumber, totalAmount } = await orderService.checkout(
      userId,
      shipping_address,
      billing_address,
      payment_method,
      notes
    );

    // Get the complete order data to return in response
    const order = await orderService.getCompleteOrder(orderId);

    // Emit real-time notification
    io.to(`user_${userId}`).emit('order_created', {
      order_id: orderId,
      order_number: orderNumber,
      status: 'pending',
      message: `Your order #${orderNumber} has been created successfully`
    });

    io.to('admin_room').emit('new_order', {
      order_id: orderId,
      user_id: userId,
      order_number: orderNumber,
      total_amount: totalAmount,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const io = req.app.get('io');

    // Check if order exists
    const order = await executeQuery(
      'SELECT id, user_id, order_number, status FROM orders WHERE id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Update order status
    await executeQuery(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Get updated order
    const updatedOrder = await executeQuery(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    // Emit real-time notification
    io.to(`user_${order[0].user_id}`).emit('order_status_update', {
      order_id: parseInt(id),
      order_number: order[0].order_number,
      status: status,
      message: `Your order #${order[0].order_number} status has been updated to: ${status}`
    });

    io.to('admin_room').emit('admin_order_update', {
      order_id: parseInt(id),
      user_id: order[0].user_id,
      order_number: order[0].order_number,
      status: status,
      updated_by: req.user.id,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: updatedOrder[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Cancel order (user or admin)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const io = req.app.get('io');

    // Get order details
    const order = await executeQuery(
      'SELECT id, user_id, order_number, status FROM orders WHERE id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Check if user can cancel this order
    if (order[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders',
        error: 'ACCESS_DENIED'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'paid'].includes(order[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
        error: 'ORDER_NOT_CANCELLABLE',
        current_status: order[0].status
      });
    }

    // Start transaction to restore stock and cancel order
    const transactionQueries = [
      // Update order status
      {
        query: 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        params: ['cancelled', id]
      }
    ];

    // Restore stock for each order item
    const orderItems = await executeQuery(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );

    for (const item of orderItems) {
      transactionQueries.push({
        query: 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        params: [item.quantity, item.product_id]
      });
    }

    await executeTransaction(transactionQueries);

    // Get updated order
    const updatedOrder = await executeQuery(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    // Emit real-time notification
    io.to(`user_${order[0].user_id}`).emit('order_cancelled', {
      order_id: parseInt(id),
      order_number: order[0].order_number,
      status: 'cancelled',
      message: `Your order #${order[0].order_number} has been cancelled`
    });

    io.to('admin_room').emit('admin_order_update', {
      order_id: parseInt(id),
      user_id: order[0].user_id,
      order_number: order[0].order_number,
      status: 'cancelled',
      cancelled_by: userId,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: updatedOrder[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, user_id } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Filter by status
    if (status) {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    // Filter by user
    if (user_id) {
      whereConditions.push('o.user_id = ?');
      params.push(user_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(oi.id) as item_count,
        pm.payment_method,
        pm.status as payment_status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN payments pm ON o.id = pm.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await executeQuery(query, [...params, parseInt(limit), offset]);

    // Count query for pagination
    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        orders,
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

module.exports = {
  getOrders,
  getOrderById,
  checkout,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
};
