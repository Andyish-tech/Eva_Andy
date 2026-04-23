const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details
      });
    }

    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    first_name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    last_name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Product creation/update
  product: Joi.object({
    name: Joi.string().trim().min(1).max(200).required()
      .messages({
        'string.empty': 'Product name is required',
        'string.max': 'Product name cannot exceed 200 characters'
      }),
    description: Joi.string().max(2000).optional(),
    price: Joi.number().positive().precision(2).required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required'
      }),
    category_id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'Category ID must be a number',
        'any.required': 'Category is required'
      }),
    sku: Joi.string().trim().min(1).max(100).required()
      .messages({
        'string.empty': 'SKU is required',
        'string.max': 'SKU cannot exceed 100 characters'
      }),
    stock_quantity: Joi.number().integer().min(0).default(0),
    min_stock_level: Joi.number().integer().min(0).default(5),
    image_url: Joi.string().uri().optional(),
    is_active: Joi.boolean().default(true)
  }),

  // Category creation/update
  category: Joi.object({
    name: Joi.string().trim().min(1).max(100).required()
      .messages({
        'string.empty': 'Category name is required',
        'string.max': 'Category name cannot exceed 100 characters'
      }),
    description: Joi.string().max(1000).optional(),
    parent_id: Joi.number().integer().positive().optional().allow(null),
    image_url: Joi.string().uri().optional()
  }),

  // Cart item
  cartItem: Joi.object({
    product_id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'Product ID must be a number',
        'any.required': 'Product ID is required'
      }),
    quantity: Joi.number().integer().min(1).required()
      .messages({
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      })
  }),

  // Order checkout
  checkout: Joi.object({
    shipping_address: Joi.string().trim().min(10).max(500).required()
      .messages({
        'string.empty': 'Shipping address is required',
        'string.min': 'Shipping address is too short',
        'string.max': 'Shipping address cannot exceed 500 characters'
      }),
    billing_address: Joi.string().trim().min(10).max(500).optional(),
    payment_method: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cash_on_delivery').required()
      .messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      }),
    notes: Joi.string().max(1000).optional()
  }),

  // Order status update
  orderStatus: Joi.object({
    status: Joi.string().valid('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled').required()
      .messages({
        'any.only': 'Invalid order status',
        'any.required': 'Order status is required'
      })
  }),

  // User profile update
  profileUpdate: Joi.object({
    first_name: Joi.string().trim().min(2).max(50).optional(),
    last_name: Joi.string().trim().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }),

  // Product search/filter
  productSearch: Joi.object({
    q: Joi.string().trim().max(100).optional(),
    category_id: Joi.number().integer().positive().optional(),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    min_rating: Joi.number().min(1).max(5).optional(),
    sort_by: Joi.string().valid('name', 'price', 'created_at', 'rating').default('created_at'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // ID parameter validation
  id: Joi.object({
    id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'ID must be a number',
        'any.required': 'ID is required'
      })
  })
};

module.exports = {
  validate,
  schemas
};
