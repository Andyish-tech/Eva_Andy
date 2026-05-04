// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: 'INTERNAL_ERROR'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: err.details || []
    };
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error = {
      success: false,
      message: 'Invalid ID format',
      error: 'INVALID_ID'
    };
    return res.status(400).json(error);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    error = {
      success: false,
      message: 'Duplicate entry. This resource already exists.',
      error: 'DUPLICATE_ENTRY'
    };
    return res.status(409).json(error);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = {
      success: false,
      message: 'Referenced resource does not exist',
      error: 'REFERENCE_NOT_FOUND'
    };
    return res.status(400).json(error);
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    error = {
      success: false,
      message: 'Cannot delete this resource as it is referenced by other records',
      error: 'RESOURCE_IN_USE'
    };
    return res.status(409).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token has expired',
      error: 'TOKEN_EXPIRED'
    };
    return res.status(401).json(error);
  }

  // Custom application errors
  if (err.isOperational) {
    error = {
      success: false,
      message: err.message,
      error: err.code || 'OPERATIONAL_ERROR'
    };
    return res.status(err.statusCode || 400).json(error);
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error = {
      success: false,
      message: 'Database connection failed',
      error: 'DATABASE_ERROR'
    };
    return res.status(503).json(error);
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      success: false,
      message: 'Too many requests. Please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    };
    return res.status(429).json(error);
  }

  // Default to 500 for unknown errors
  res.status(500).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};
