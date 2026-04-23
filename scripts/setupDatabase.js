const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'klein_ecommerce'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('Database created or already exists');

    // Switch to the database
    await connection.execute(`USE ${process.env.DB_NAME || 'klein_ecommerce'}`);

    // Create tables
    await createTables(connection);
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

async function createTables(connection) {
  // Users table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role ENUM('admin', 'customer') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB
  `);

  // Categories table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      parent_id INT NULL,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_name (name),
      INDEX idx_parent (parent_id)
    ) ENGINE=InnoDB
  `);

  // Products table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INT NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      stock_quantity INT DEFAULT 0,
      min_stock_level INT DEFAULT 5,
      image_url VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      INDEX idx_name (name),
      INDEX idx_category (category_id),
      INDEX idx_sku (sku),
      INDEX idx_price (price),
      INDEX idx_stock (stock_quantity),
      FULLTEXT idx_search (name, description)
    ) ENGINE=InnoDB
  `);

  // Carts table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB
  `);

  // Cart items table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_cart_product (cart_id, product_id),
      INDEX idx_cart (cart_id),
      INDEX idx_product (product_id)
    ) ENGINE=InnoDB
  `);

  // Orders table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_address TEXT NOT NULL,
      billing_address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      INDEX idx_user (user_id),
      INDEX idx_status (status),
      INDEX idx_order_number (order_number),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB
  `);

  // Order items table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      INDEX idx_order (order_id),
      INDEX idx_product (product_id)
    ) ENGINE=InnoDB
  `);

  // Payments table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      transaction_id VARCHAR(255),
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      INDEX idx_order (order_id),
      INDEX idx_status (status),
      INDEX idx_transaction (transaction_id)
    ) ENGINE=InnoDB
  `);

  // Product reviews table (for ratings)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_product_user (product_id, user_id),
      INDEX idx_product (product_id),
      INDEX idx_user (user_id),
      INDEX idx_rating (rating)
    ) ENGINE=InnoDB
  `);

  console.log('All tables created successfully');
}

// Insert sample data
async function insertSampleData(connection) {
  try {
    // Insert sample categories
    await connection.execute(`
      INSERT IGNORE INTO categories (id, name, description) VALUES
      (1, 'Electronics', 'Electronic devices and gadgets'),
      (2, 'Clothing', 'Fashion and apparel'),
      (3, 'Books', 'Books and literature'),
      (4, 'Home & Garden', 'Home improvement and garden supplies')
    `);

    // Insert sample products
    await connection.execute(`
      INSERT IGNORE INTO products (id, name, description, price, category_id, sku, stock_quantity) VALUES
      (1, 'Laptop Pro', 'High-performance laptop for professionals', 1299.99, 1, 'LP-001', 50),
      (2, 'Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 1, 'WM-002', 200),
      (3, 'Cotton T-Shirt', 'Comfortable cotton t-shirt', 19.99, 2, 'CT-003', 100),
      (4, 'JavaScript Guide', 'Complete JavaScript programming guide', 39.99, 3, 'JS-004', 75),
      (5, 'Garden Tools Set', 'Complete garden tools set', 89.99, 4, 'GT-005', 30)
    `);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createTables, insertSampleData };
