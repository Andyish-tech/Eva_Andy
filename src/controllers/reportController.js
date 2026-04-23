const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Sales reports
const getSalesReport = async (req, res, next) => {
  try {
    const { period = 'month', start_date, end_date } = req.query;
    
    let dateFilter = '';
    let dateFormat = '';
    
    if (start_date && end_date) {
      dateFilter = `AND DATE(o.created_at) BETWEEN ? AND ?`;
      dateFormat = '%Y-%m-%d';
    } else {
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }
    }

    const query = `
      SELECT 
        DATE_FORMAT(o.created_at, '${dateFormat}') as period,
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders o
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY DATE_FORMAT(o.created_at, '${dateFormat}')
      ORDER BY period DESC
      LIMIT 12
    `;

    const params = start_date && end_date ? [start_date, end_date] : [];
    const salesData = await executeQuery(query, params);

    // Get overall summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND status != 'cancelled'
    `;

    const summary = await executeQuery(summaryQuery);

    res.status(200).json({
      success: true,
      data: {
        sales_data: salesData,
        summary: summary[0],
        period
      }
    });

  } catch (error) {
    next(error);
  }
};

// Product performance reports
const getProductReport = async (req, res, next) => {
  try {
    const { sort_by = 'revenue', limit = 20 } = req.query;
    
    const validSortFields = ['revenue', 'quantity', 'orders', 'rating'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'revenue';
    
    let orderBy = '';
    switch (sortField) {
      case 'revenue':
        orderBy = 'total_revenue DESC';
        break;
      case 'quantity':
        orderBy = 'total_quantity DESC';
        break;
      case 'orders':
        orderBy = 'order_count DESC';
        break;
      case 'rating':
        orderBy = 'avg_rating DESC';
        break;
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock_quantity,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      WHERE p.is_active = true
      GROUP BY p.id
      HAVING total_quantity > 0 OR order_count > 0
      ORDER BY ${orderBy}
      LIMIT ?
    `;

    const products = await executeQuery(query, [parseInt(limit)]);

    // Get top categories by revenue
    const categoryQuery = `
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.quantity), 0) as total_quantity
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY c.id
      HAVING total_revenue > 0
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const categories = await executeQuery(categoryQuery);

    res.status(200).json({
      success: true,
      data: {
        top_products: products,
        top_categories: categories,
        sort_by: sortField
      }
    });

  } catch (error) {
    next(error);
  }
};

// User activity reports
const getUserReport = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFormat = '';
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    // New users over time
    const newUsersQuery = `
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY period DESC
      LIMIT 12
    `;

    const newUsers = await executeQuery(newUsersQuery);

    // Top customers by spending
    const topCustomersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        u.created_at as customer_since
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE u.role = 'customer'
      GROUP BY u.id
      HAVING order_count > 0
      ORDER BY total_spent DESC
      LIMIT 20
    `;

    const topCustomers = await executeQuery(topCustomersQuery);

    // User activity summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_last_30_days,
        COUNT(CASE WHERE id IN (SELECT DISTINCT user_id FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) THEN 1 END) as active_users_last_30_days
      FROM users
    `;

    const summary = await executeQuery(summaryQuery);

    // User registration trends
    const registrationTrendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as registrations
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const registrationTrends = await executeQuery(registrationTrendsQuery);

    res.status(200).json({
      success: true,
      data: {
        new_users_over_time: newUsers,
        top_customers: topCustomers,
        user_summary: summary[0],
        registration_trends: registrationTrends,
        period
      }
    });

  } catch (error) {
    next(error);
  }
};

// Revenue analytics
const getRevenueReport = async (req, res, next) => {
  try {
    const { period = 'month', start_date, end_date } = req.query;
    
    let dateFilter = '';
    let dateFormat = '';
    
    if (start_date && end_date) {
      dateFilter = `AND DATE(o.created_at) BETWEEN ? AND ?`;
      dateFormat = '%Y-%m-%d';
    } else {
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }
    }

    // Revenue over time
    const revenueQuery = `
      SELECT 
        DATE_FORMAT(o.created_at, '${dateFormat}') as period,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(*) as order_count,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value
      FROM orders o
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY DATE_FORMAT(o.created_at, '${dateFormat}')
      ORDER BY period DESC
      LIMIT 12
    `;

    const params = start_date && end_date ? [start_date, end_date] : [];
    const revenueData = await executeQuery(revenueQuery, params);

    // Revenue by category
    const categoryRevenueQuery = `
      SELECT 
        c.name as category,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count,
        COALESCE(SUM(oi.quantity), 0) as quantity_sold
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      WHERE c.id IS NOT NULL
      GROUP BY c.id
      HAVING revenue > 0
      ORDER BY revenue DESC
    `;

    const categoryRevenue = await executeQuery(categoryRevenueQuery);

    // Revenue by payment method
    const paymentRevenueQuery = `
      SELECT 
        pm.payment_method,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(*) as order_count,
        COUNT(CASE WHEN pm.status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN pm.status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN pm.status = 'failed' THEN 1 END) as failed_payments
      FROM payments pm
      JOIN orders o ON pm.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY pm.payment_method
      ORDER BY revenue DESC
    `;

    const paymentRevenue = await executeQuery(paymentRevenueQuery);

    // Overall revenue summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COALESCE(SUM(total_amount), 0) / COUNT(*) as revenue_per_order,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    `;

    const summary = await executeQuery(summaryQuery);

    res.status(200).json({
      success: true,
      data: {
        revenue_over_time: revenueData,
        revenue_by_category: categoryRevenue,
        revenue_by_payment_method: paymentRevenue,
        revenue_summary: summary[0],
        period
      }
    });

  } catch (error) {
    next(error);
  }
};

// Dashboard overview
const getDashboardOverview = async (req, res, next) => {
  try {
    // Get key metrics
    const metricsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled') as today_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled') as today_revenue,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as today_new_users
    `;

    const metrics = await executeQuery(metricsQuery);

    // Recent orders
    const recentOrdersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.created_at,
        u.first_name,
        u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    const recentOrders = await executeQuery(recentOrdersQuery);

    // Top products this month
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        COALESCE(SUM(oi.quantity), 0) as quantity_sold,
        COALESCE(SUM(oi.total_price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      WHERE o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
      GROUP BY p.id
      HAVING quantity_sold > 0
      ORDER BY quantity_sold DESC
      LIMIT 5
    `;

    const topProducts = await executeQuery(topProductsQuery);

    // Low stock alerts
    const lowStockQuery = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.min_stock_level,
        (p.min_stock_level - p.stock_quantity) as shortage
      FROM products p
      WHERE p.stock_quantity <= p.min_stock_level AND p.is_active = true
      ORDER BY shortage DESC
      LIMIT 5
    `;

    const lowStock = await executeQuery(lowStockQuery);

    // Order status distribution
    const orderStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_value
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY status
      ORDER BY count DESC
    `;

    const orderStatus = await executeQuery(orderStatusQuery);

    res.status(200).json({
      success: true,
      data: {
        metrics: metrics[0],
        recent_orders: recentOrders,
        top_products: topProducts,
        low_stock_alerts: lowStock,
        order_status_distribution: orderStatus
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getProductReport,
  getUserReport,
  getRevenueReport,
  getDashboardOverview
};
