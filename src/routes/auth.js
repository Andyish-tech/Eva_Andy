const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', validate(schemas.register), asyncHandler(authController.register));
router.post('/login', validate(schemas.login), asyncHandler(authController.login));

// Protected routes
router.get('/validate', authenticate, asyncHandler(authController.validateToken));
router.post('/refresh', authenticate, asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/profile', authenticate, asyncHandler(authController.getProfile));

module.exports = router;
