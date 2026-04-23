# KLEIN E-Commerce API Documentation

A scalable e-commerce backend system with modular architecture, secure authentication, and analytics-driven reporting.

## Base URL
```
http://localhost:3000/api
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {...}, // Optional
  "error": "ERROR_CODE" // Optional, only when success is false
}
```

## Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (duplicate, etc.)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "customer",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Validate Token
```http
GET /auth/validate
Authorization: Bearer <token>
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## Product Endpoints

### Get Products
```http
GET /products
```

**Query Parameters:**
- `q` - Search query (string)
- `category_id` - Filter by category (number)
- `min_price` - Minimum price (number)
- `max_price` - Maximum price (number)
- `min_rating` - Minimum rating (1-5)
- `sort_by` - Sort field: name, price, created_at, rating
- `sort_order` - Sort order: asc, desc
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Laptop Pro",
        "description": "High-performance laptop",
        "price": 1299.99,
        "category_id": 1,
        "category_name": "Electronics",
        "sku": "LP-001",
        "stock_quantity": 50,
        "image_url": "https://example.com/laptop.jpg",
        "avg_rating": 4.5,
        "review_count": 12
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Get Single Product
```http
GET /products/:id
```

### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category_id": 1,
  "sku": "NP-001",
  "stock_quantity": 100,
  "min_stock_level": 10,
  "image_url": "https://example.com/product.jpg",
  "is_active": true
}
```

### Update Product (Admin Only)
```http
PUT /products/:id
Authorization: Bearer <admin_token>
```

### Delete Product (Admin Only)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

### Get Low Stock Products (Admin Only)
```http
GET /products/admin/low-stock
Authorization: Bearer <admin_token>
```

---

## Category Endpoints

### Get Categories
```http
GET /categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic devices",
        "parent_id": null,
        "parent_name": null,
        "product_count": 25,
        "subcategories": [...]
      }
    ],
    "flat_list": [...]
  }
}
```

### Get Single Category
```http
GET /categories/:id
```

### Create Category (Admin Only)
```http
POST /categories
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "parent_id": 1,
  "image_url": "https://example.com/category.jpg"
}
```

### Update Category (Admin Only)
```http
PUT /categories/:id
Authorization: Bearer <admin_token>
```

### Delete Category (Admin Only)
```http
DELETE /categories/:id
Authorization: Bearer <admin_token>
```

---

## Cart Endpoints

All cart endpoints require authentication.

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": 1,
    "items": [
      {
        "cart_item_id": 1,
        "quantity": 2,
        "product_id": 1,
        "name": "Laptop Pro",
        "price": 1299.99,
        "subtotal": 2599.98
      }
    ],
    "summary": {
      "total_items": 2,
      "total_amount": 2599.98
    }
  }
}
```

### Add Item to Cart
```http
POST /cart/add
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/update
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 3
}
```

### Remove Item from Cart
```http
DELETE /cart/remove/:product_id
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart/clear
Authorization: Bearer <token>
```

### Validate Cart
```http
GET /cart/validate
Authorization: Bearer <token>
```

---

## Order Endpoints

All order endpoints require authentication.

### Get User Orders
```http
GET /orders
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status: pending, paid, processing, shipped, delivered, cancelled
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Get Single Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Checkout
```http
POST /orders/checkout
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shipping_address": "123 Main St, City, State 12345",
  "billing_address": "123 Main St, City, State 12345",
  "payment_method": "credit_card",
  "notes": "Please deliver after 5 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-1640995200000-ABC12",
      "status": "pending",
      "total_amount": 2599.98,
      "items": [...]
    }
  }
}
```

### Cancel Order
```http
POST /orders/:id/cancel
Authorization: Bearer <token>
```

### Get All Orders (Admin Only)
```http
GET /orders/admin/all
Authorization: Bearer <admin_token>
```

### Update Order Status (Admin Only)
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

---

## User Endpoints

All user endpoints require authentication.

### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

### Change Password
```http
POST /users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!"
}
```

### Get User Orders
```http
GET /users/orders
Authorization: Bearer <token>
```

---

## Admin User Management

### Get All Users (Admin Only)
```http
GET /users/admin/all
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `role` - Filter by role: admin, customer
- `search` - Search by name or email
- `page` - Page number
- `limit` - Items per page

### Get Single User (Admin Only)
```http
GET /users/admin/:id
Authorization: Bearer <admin_token>
```

### Update User Role (Admin Only)
```http
PUT /users/admin/:id/role
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

### Delete User (Admin Only)
```http
DELETE /users/admin/:id
Authorization: Bearer <admin_token>
```

---

## Reports Endpoints (Admin Only)

All report endpoints require admin authentication.

### Sales Report
```http
GET /reports/sales
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `period` - Time period: day, week, month, year
- `start_date` - Custom start date (YYYY-MM-DD)
- `end_date` - Custom end date (YYYY-MM-DD)

### Product Report
```http
GET /reports/products
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `sort_by` - Sort by: revenue, quantity, orders, rating
- `limit` - Number of results (default: 20)

### User Report
```http
GET /reports/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `period` - Time period: day, week, month, year

### Revenue Report
```http
GET /reports/revenue
Authorization: Bearer <admin_token>
```

### Dashboard Overview
```http
GET /reports/dashboard
Authorization: Bearer <admin_token>
```

---

## Real-Time Features

The API supports real-time notifications using Socket.io. Connect to:
```
ws://localhost:3000
```

### Events
- `order_created` - New order created
- `order_status_update` - Order status changed
- `order_cancelled` - Order cancelled
- `new_order` - Admin notification for new order
- `admin_order_update` - Admin order updates

### Join Rooms
```javascript
// Join user-specific room for order updates
socket.emit('join_user_room', userId);

// Join admin room for admin notifications
socket.emit('join_admin_room');
```

---

## Rate Limiting
- **Global Limit**: 100 requests per 15 minutes per IP
- **Endpoints**: All `/api/*` endpoints are rate limited

## Security Features
- JWT authentication with expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CORS protection
- Helmet security headers

## Testing
Use the provided Postman collection or test with your preferred API client.

## Support
For API support and questions, contact the development team.
