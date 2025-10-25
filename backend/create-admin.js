require('dotenv').config();
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

async function createAdmin() {
  let pool;

  try {
    console.log('📡 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected\n');

    // Check if users table exists
    const tableCheck = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'users'
    `);

    if (tableCheck.recordset.length === 0) {
      console.log('📦 Creating users table...');
      await pool.request().query(`
        CREATE TABLE users (
          user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
          username NVARCHAR(50) UNIQUE NOT NULL,
          password_hash NVARCHAR(255) NOT NULL,
          full_name NVARCHAR(100),
          is_active BIT DEFAULT 1,
          created_date DATETIME DEFAULT GETDATE(),
          modified_date DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✅ Users table created\n');
    } else {
      console.log('✅ Users table exists\n');
    }

    // Check if admin user exists
    const userCheck = await pool.request()
      .input('username', sql.NVarChar, 'admin')
      .query('SELECT * FROM users WHERE username = @username');

    if (userCheck.recordset.length > 0) {
      console.log('⚠️  Admin user already exists, updating password...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      await pool.request()
        .input('username', sql.NVarChar, 'admin')
        .input('password', sql.NVarChar, hashedPassword)
        .query('UPDATE users SET password_hash = @password WHERE username = @username');

      console.log('✅ Admin password updated\n');
    } else {
      console.log('👤 Creating admin user...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      await pool.request()
        .input('username', sql.NVarChar, 'admin')
        .input('password', sql.NVarChar, hashedPassword)
        .input('fullName', sql.NVarChar, 'System Administrator')
        .query(`
          INSERT INTO users (username, password_hash, full_name, is_active)
          VALUES (@username, @password, @fullName, 1)
        `);

      console.log('✅ Admin user created\n');
    }

    // Show all users
    const users = await pool.request().query('SELECT user_id, username, full_name, is_active FROM users');
    console.log('📋 Current users:');
    console.table(users.recordset);

    console.log('\n✨ Done! You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

createAdmin();
