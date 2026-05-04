const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const reportController = require('../controllers/reportController');

// All report routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Report endpoints
router.get('/sales', asyncHandler(reportController.getSalesReport));
router.get('/products', asyncHandler(reportController.getProductReport));
router.get('/users', asyncHandler(reportController.getUserReport));
router.get('/revenue', asyncHandler(reportController.getRevenueReport));
router.get('/dashboard', asyncHandler(reportController.getDashboardOverview));

module.exports = router;
