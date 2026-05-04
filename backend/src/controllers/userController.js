const { executeQuery } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/auth');
const { AppError } = require('../middleware/errorHandler');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `;

    const users = await executeQuery(query, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Get user statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE user_id = ?) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = ? AND status != 'cancelled') as total_spent,
        (SELECT COUNT(*) FROM product_reviews WHERE user_id = ?) as total_reviews
    `;

    const stats = await executeQuery(statsQuery, [userId, userId, userId]);

    const user = {
      ...users[0],
      statistics: stats[0]
    };

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;

    // Build dynamic update query
    const updateFields = {};
    if (first_name !== undefined) updateFields.first_name = first_name;
    if (last_name !== undefined) updateFields.last_name = last_name;
    if (phone !== undefined) updateFields.phone = phone;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'NO_UPDATE_FIELDS'
      });
    }

    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(userId);

    await executeQuery(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get updated user
    const updatedUser = await executeQuery(
      `SELECT id, first_name, last_name, email, phone, role, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Get current password hash
    const user = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, user[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Filter by role
    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    // Search by name or email
    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await executeQuery(query, [...params, parseInt(limit), offset]);

    // Count query for pagination
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// Get single user by ID (admin only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `;

    const users = await executeQuery(query, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Get user statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE user_id = ?) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = ? AND status != 'cancelled') as total_spent,
        (SELECT COUNT(*) FROM product_reviews WHERE user_id = ?) as total_reviews,
        (SELECT COUNT(*) FROM carts WHERE user_id = ?) as has_cart
    `;

    const stats = await executeQuery(statsQuery, [id, id, id, id]);

    const user = {
      ...users[0],
      statistics: stats[0]
    };

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
        error: 'INVALID_ROLE',
        valid_roles: ['admin', 'customer']
      });
    }

    // Check if user exists
    const existingUser = await executeQuery('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
        error: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    // Update user role
    await executeQuery(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, id]
    );

    // Get updated user
    const updatedUser = await executeQuery(
      `SELECT id, first_name, last_name, email, phone, role, created_at, updated_at 
       FROM users WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: updatedUser[0],
        previous_role: existingUser[0].role
      }
    });

  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await executeQuery('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
        error: 'CANNOT_DELETE_OWN_ACCOUNT'
      });
    }

    // Check if user has orders
    const orderCount = await executeQuery(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [id]
    );

    if (orderCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user: user has existing orders',
        error: 'USER_HAS_ORDERS',
        order_count: orderCount[0].count
      });
    }

    // Delete user (cascades will handle cart, reviews, etc.)
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get user's order history
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    // Check authorization (admin can view any user, users can only view their own)
    if (userId !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED'
      });
    }

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
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
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

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserOrders
};
