# KLEIN E-Commerce Backend

A scalable e-commerce backend system with modular architecture, secure authentication, and analytics-driven reporting.

## Features

- **RESTful API Architecture** - Express.js with comprehensive endpoints
- **Secure Authentication** - JWT-based with bcrypt password hashing
- **Role-Based Access Control** - Admin vs Customer roles
- **Database Design** - Optimized MySQL with proper relationships and indexing
- **Business Logic Layer** - Cart persistence, checkout flow, order lifecycle
- **Real-Time Order Tracking** - Status updates and optional WebSocket support
- **Search & Filtering** - SQL FULLTEXT search with advanced filters
- **Analytics & Reporting** - Sales reports, product analytics, revenue tracking
- **Input Validation** - Joi/express-validator integration
- **Error Handling** - Comprehensive middleware for robust error management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Validation**: Joi, express-validator
- **Real-time**: Socket.io
- **Development**: Nodemon, Jest

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
4. Set up the database:
   ```bash
   npm run db:setup
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token

### Products
- `GET /api/products` - Get products with search/filter
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders/checkout` - Process checkout
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin)

### Reports
- `GET /api/reports/sales` - Sales analytics
- `GET /api/reports/products` - Product performance
- `GET /api/reports/users` - User activity reports

## Database Schema

The system uses the following core tables:
- `users` - User accounts and roles
- `products` - Product catalog
- `categories` - Product categories
- `carts` - User shopping carts
- `cart_items` - Items in carts
- `orders` - Order records
- `order_items` - Items in orders
- `payments` - Payment transactions

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input sanitization
- SQL injection prevention

## Testing

```bash
npm test
```

## License

MIT License
