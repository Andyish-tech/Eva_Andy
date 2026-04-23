const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const userController = require('../controllers/userController');

// All user routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', validate(schemas.profileUpdate), asyncHandler(userController.updateProfile));
router.post('/change-password', asyncHandler(userController.changePassword));
router.get('/orders', asyncHandler(userController.getUserOrders));

// Admin only routes
router.get('/admin/all', authorize('admin'), asyncHandler(userController.getAllUsers));
router.get('/admin/:id', authorize('admin'), validate(schemas.id, 'params'), asyncHandler(userController.getUserById));
router.put('/admin/:id/role', authorize('admin'), validate(schemas.id, 'params'), asyncHandler(userController.updateUserRole));
router.delete('/admin/:id', authorize('admin'), validate(schemas.id, 'params'), asyncHandler(userController.deleteUser));
router.get('/admin/:id/orders', authorize('admin'), validate(schemas.id, 'params'), asyncHandler(userController.getUserOrders));

module.exports = router;
