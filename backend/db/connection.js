const sql = require('mssql');
const dbConfig = require('../config/db.config');

let pool = null;

const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    console.log('✅ MSSQL Database connected successfully');

    pool.on('error', err => {
      console.error('❌ Database pool error:', err);
      pool = null;
    });

    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

module.exports = {
  getConnection,
  closeConnection,
  sql
};
