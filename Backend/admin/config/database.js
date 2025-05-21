const sql = require('mssql');
require('dotenv').config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456aA@$',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'bongda',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Initialize connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Handle connection errors
poolConnect.catch(err => {
  console.error('Error connecting to SQL Server:', err);
});

// Export methods for database operations
module.exports = {
  // Initialize the database connection
  initialize: async () => {
    try {
      await poolConnect;
      console.log('Connected to SQL Server database');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw error;
    }
  },

  // Execute a query
  query: async (queryText, params = []) => {
    await poolConnect;
    try {
      const request = pool.request();
      
      // Add parameters
      if (params && params.length > 0) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      }
      
      const result = await request.query(queryText);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Close the pool
  close: async () => {
    try {
      await pool.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}; 