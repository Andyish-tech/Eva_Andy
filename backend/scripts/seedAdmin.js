const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function seedAdmin() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'klein_ecommerce'
    });

    const email = 'admin@klein.com';
    const password = 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if admin already exists
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      // Just update it to be sure
      await connection.execute('UPDATE users SET role = "admin", password_hash = ? WHERE email = ?', [passwordHash, email]);
      console.log('Admin account already exists. Reset password and ensured admin role.');
    } else {
      await connection.execute(
        'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['Super', 'Admin', email, passwordHash, 'admin']
      );
      console.log('Successfully created new Admin account!');
    }

    console.log('--- Admin Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Failed to seed admin:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedAdmin();
