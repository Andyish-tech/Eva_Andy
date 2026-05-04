const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working!' });
});

// Public routes
router.post('/register', asyncHandler(authController.register));

router.post('/login', (req, res, next) => {
  try {
    return validate(schemas.login)(req, res, next);
  } catch (error) {
    console.error('Validation error:', error);
    next(error);
  }
}, asyncHandler(authController.login));

// Protected routes
router.get('/validate', authenticate, asyncHandler(authController.validateToken));
router.post('/refresh', authenticate, asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/profile', authenticate, asyncHandler(authController.getProfile));

module.exports = router;
