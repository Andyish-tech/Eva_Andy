const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const orderController = require('../controllers/orderController');

// All order routes require authentication
router.use(authenticate);

// User routes
router.get('/', asyncHandler(orderController.getOrders));
router.get('/:id', validate(schemas.id, 'params'), asyncHandler(orderController.getOrderById));
router.post('/checkout', validate(schemas.checkout), asyncHandler(orderController.checkout));
router.post('/:id/cancel', validate(schemas.id, 'params'), asyncHandler(orderController.cancelOrder));

// Admin only routes
router.get('/admin/all', authorize('admin'), asyncHandler(orderController.getAllOrders));
router.put('/:id/status', authorize('admin'), validate(schemas.id, 'params'), validate(schemas.orderStatus), asyncHandler(orderController.updateOrderStatus));

module.exports = router;
