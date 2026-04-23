const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const productController = require('../controllers/productController');

// Public routes
router.get('/', validate(schemas.productSearch, 'query'), asyncHandler(productController.getProducts));
router.get('/:id', validate(schemas.id, 'params'), asyncHandler(productController.getProductById));

// Admin only routes
router.post('/', authenticate, authorize('admin'), validate(schemas.product), asyncHandler(productController.createProduct));
router.put('/:id', authenticate, authorize('admin'), validate(schemas.id, 'params'), validate(schemas.product), asyncHandler(productController.updateProduct));
router.delete('/:id', authenticate, authorize('admin'), validate(schemas.id, 'params'), asyncHandler(productController.deleteProduct));
router.get('/admin/low-stock', authenticate, authorize('admin'), asyncHandler(productController.getLowStockProducts));

module.exports = router;
