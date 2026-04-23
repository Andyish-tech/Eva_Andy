const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const cartController = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticate);

// Cart endpoints
router.get('/', asyncHandler(cartController.getCart));
router.post('/add', validate(schemas.cartItem), asyncHandler(cartController.addToCart));
router.put('/update', validate(schemas.cartItem), asyncHandler(cartController.updateCartItem));
router.delete('/remove/:product_id', validate(schemas.id, 'params'), asyncHandler(cartController.removeFromCart));
router.delete('/clear', asyncHandler(cartController.clearCart));
router.get('/validate', asyncHandler(cartController.validateCart));

module.exports = router;
