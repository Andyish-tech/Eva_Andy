const { executeQuery } = require('../config/database');
const { hashPassword, comparePassword, generateToken, validatePasswordStrength } = require('../utils/auth');
const { AppError } = require('../middleware/errorHandler');

// User registration
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        error: 'WEAK_PASSWORD',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        error: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await executeQuery(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, passwordHash, phone]
    );

    // Get created user
    const newUser = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // Generate JWT token
    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser[0],
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// User login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const users = await executeQuery(
      'SELECT id, first_name, last_name, email, password_hash, phone, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// Validate token
const validateToken = async (req, res, next) => {
  try {
    // If we reach here, the token is valid (passed through auth middleware)
    const user = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: user[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const user = await executeQuery(
      'SELECT id, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Generate new token
    const token = generateToken({
      id: user[0].id,
      email: user[0].email,
      role: user[0].role
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// Logout (client-side token removal)
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // But we can add token blacklisting in a production environment
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  validateToken,
  refreshToken,
  logout,
  getProfile
};
