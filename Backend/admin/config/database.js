const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Check if SQL Server configuration exists
const hasSqlServerConfig = process.env.DB_USER && process.env.DB_PASSWORD && 
                          process.env.DB_SERVER && process.env.DB_DATABASE;

if (!hasSqlServerConfig) {
  console.error('Error: SQL Server configuration is missing. Please set DB_USER, DB_PASSWORD, DB_SERVER, and DB_DATABASE environment variables.');
  process.exit(1);
}

// Initialize SQL Server database with Sequelize
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false // Set to console.log to see SQL queries
  }
);

// Create a function to execute queries that matches the API of the original function
async function executeQuery(sql, binds = {}, options = {}) {
  try {
    // Convert Oracle style binds (:param) to Sequelize style (?/@ for SQL Server)
    // Replace :param with @param for SQL Server
    const modifiedSql = sql.replace(/:\w+/g, (match) => {
      return '@' + match.substring(1);
    });
    
    // Convert array binds to object if needed
    let replacements = binds;
    if (Array.isArray(binds)) {
      replacements = {};
      const matches = sql.match(/:\w+/g) || [];
      matches.forEach((match, index) => {
        if (index < binds.length) {
          // Remove the colon for the key
          const key = match.substring(1);
          replacements[key] = binds[index];
        }
      });
    }
    
    // For SELECT queries
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const results = await sequelize.query(modifiedSql, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
        ...options
      });
      
      return {
        rows: results || [],
        rowsAffected: results ? results.length : 0
      };
    }
    
    // For INSERT, UPDATE, DELETE queries
    const [, affectedRows] = await sequelize.query(modifiedSql, {
      replacements,
      type: Sequelize.QueryTypes.UPDATE,
      ...options
    });
    
    return {
      rows: [],
      rowsAffected: affectedRows || 0
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
    console.error('\n=========== DATABASE CONNECTION ERROR ===========');
    console.log('Could not connect to SQL Server database. Please ensure:');
    console.log('1. SQL Server is installed and running');
    console.log('2. SQL Server is accepting connections');
    console.log('3. Your .env file has correct credentials');
    console.log('\nPossible solutions:');
    console.log('- Install SQL Server: https://www.microsoft.com/sql-server/');
    console.log('- Use Docker: docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=yourPassword" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest');
    console.log('- Update .env with correct connection information');
    console.log('===============================================\n');
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