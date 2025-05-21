const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize SQLite database with Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false // Set to console.log to see SQL queries
});

// Create a function to execute queries that matches the API of the original function
async function executeQuery(sql, binds = [], options = {}) {
  try {
    const [results] = await sequelize.query(sql, {
      replacements: Array.isArray(binds) ? binds : Object.values(binds),
      type: Sequelize.QueryTypes.SELECT,
      ...options
    });
    
    return {
      rows: results || [],
      rowsAffected: results ? results.length : 0
    };
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync database if needed
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
}

async function close() {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
}

module.exports = {
  sequelize,
  initialize,
  close,
  executeQuery
}; 