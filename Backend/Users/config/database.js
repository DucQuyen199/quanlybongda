const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

const hasOracleConfig = process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_CONNECTION_STRING;

if (!hasOracleConfig) {
  console.warn('Oracle DB env vars missing, falling back to SQLite admin database');
  // Use SQLite admin database config
  const adminDb = require('../../admin/config/database');
  async function initialize() {
    await adminDb.initialize();
  }
  
  async function getConnection() {
    return {
      execute: (sql, binds = [], options = {}) => adminDb.executeQuery(sql, binds, options),
      close: async () => {}
    };
  }
  
  module.exports = { initialize, getConnection };
  return;
}

// Oracle config
// Optional: set Oracle client library directory if needed
// oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });

async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('Oracle connection pool started');
  } catch (err) {
    console.error('Error initializing Oracle pool', err);
    process.exit(1);
  }
}

async function getConnection() {
  return oracledb.getConnection();
}

module.exports = {
  initialize,
  getConnection,
}; 