const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', asyncHandler(categoryController.getCategories));
router.get('/:id', validate(schemas.id, 'params'), asyncHandler(categoryController.getCategoryById));

// Admin only routes
router.post('/', authenticate, authorize('admin'), validate(schemas.category), asyncHandler(categoryController.createCategory));
router.put('/:id', authenticate, authorize('admin'), validate(schemas.id, 'params'), validate(schemas.category), asyncHandler(categoryController.updateCategory));
router.delete('/:id', authenticate, authorize('admin'), validate(schemas.id, 'params'), asyncHandler(categoryController.deleteCategory));

module.exports = router;
