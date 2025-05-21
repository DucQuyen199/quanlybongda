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

  // Execute a query with positional parameters
  query: async (queryText, params = [], options = {}) => {
    await poolConnect;
    try {
      let request;
      
      if (options && options.transaction) {
        request = new sql.Request(options.transaction);
      } else {
        request = pool.request();
      }
      
      // Add parameters
      if (params && params.length) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      }
      
      const result = await request.query(queryText);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  },

  // Execute a query with named parameters
  queryWithNamedParams: async (queryText, params = {}) => {
    await poolConnect;
    try {
      const request = pool.request();
      
      // Add parameters
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
      
      const result = await request.query(queryText);
      return result;
    } catch (error) {
      console.error('Database query error with named params:', error);
      throw error;
    }
  },

  // Begin a transaction
  beginTransaction: async () => {
    await poolConnect;
    try {
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      return transaction;
    } catch (error) {
      console.error('Error beginning transaction:', error);
      throw error;
    }
  },

  // Commit a transaction
  commitTransaction: async (transaction) => {
    try {
      await transaction.commit();
    } catch (error) {
      console.error('Error committing transaction:', error);
      throw error;
    }
  },

  // Rollback a transaction
  rollbackTransaction: async (transaction) => {
    try {
      await transaction.rollback();
    } catch (error) {
      console.error('Error rolling back transaction:', error);
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