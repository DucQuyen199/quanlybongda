const mssql = require('mssql');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Check if SQL Server configuration exists
const hasSqlServerConfig = process.env.DB_USER && process.env.DB_PASSWORD && 
                          process.env.DB_SERVER && process.env.DB_DATABASE;
if (!hasSqlServerConfig) {
  console.warn('Warning: SQL Server configuration is missing. Running in mock database mode.');
  // Continue without exiting
}

// SQL Server connection configuration
const sqlConfig = {
  user: 'sa',
  password: '123456aA@$',
  server: 'localhost',
  database: 'bongda',
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: true, // For local dev / self-signed certs
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create a mock DB module for development when SQL Server is unavailable
const mockDb = {
  pool: null,
  tables: new Map(),
  
  getConnection() {
    return {
      request: () => ({
        query: async (sql) => {
          console.log('Mock executing SQL:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
          
          // For queries checking table existence
          if (sql.toUpperCase().includes('SELECT COUNT(*) AS COUNT FROM INFORMATION_SCHEMA.TABLES')) {
            const tableMatch = sql.match(/TABLE_NAME\s+=\s+'([^']+)'/i);
            if (tableMatch && tableMatch[1]) {
              const tableName = tableMatch[1];
              // Return 0 to indicate table doesn't exist, so it will be created
              return { recordset: [{ count: this.tables.has(tableName) ? 1 : 0 }] };
            }
          }
          
          // For CREATE TABLE statements
          if (sql.toUpperCase().includes('CREATE TABLE')) {
            const tableMatch = sql.match(/CREATE\s+TABLE\s+(\w+)/i);
            if (tableMatch && tableMatch[1]) {
              const tableName = tableMatch[1];
              this.tables.set(tableName, sql);
              console.log(`Mock created table ${tableName}`);
            }
          }
          
          return { recordset: [] };
        }
      }),
      close: async () => console.log('Mock connection closed')
    };
  }
};

// Track the connection status to avoid crashing
let isSqlServerAvailable = false;
let pool = null;

async function initialize() {
  try {
    // Try to initialize SQL Server connection pool
    pool = await mssql.connect(sqlConfig);
    console.log('SQL Server connection pool started');
    isSqlServerAvailable = true;
    
    // Test the connection before proceeding
    try {
      await pool.request().query('SELECT 1');
      console.log('Successfully connected to SQL Server database');
    } catch (err) {
      console.error(`SQL Server connection test failed: ${err.message}`);
      console.error('The application will run in mock mode - database operations will be simulated.');
      isSqlServerAvailable = false;
    }
    
    // Only create schema if connected successfully
    if (isSqlServerAvailable) {
      await createSchemaFromSqlFile();
    } else {
      console.log('\n=========== DATABASE CONNECTION ERROR ===========');
      console.log('Could not connect to SQL Server database. Please ensure:');
      console.log('1. SQL Server is installed and running');
      console.log('2. SQL Server is accepting connections');
      console.log('3. Your .env file has correct credentials');
      console.log('\nPossible solutions:');
      console.log('- Install SQL Server: https://www.microsoft.com/sql-server/');
      console.log('- Use Docker: docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=yourPassword" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest');
      console.log('- Update .env with correct connection information');
      console.log('===============================================\n');
    }
  } catch (err) {
    console.error('Error initializing SQL Server pool:', err.message);
    isSqlServerAvailable = false;
    console.log('Running in mock database mode - database operations will be simulated');
  }
}

async function getConnection() {
  if (isSqlServerAvailable) {
    try {
      // Return the pool for SQL Server connections
      return pool;
    } catch (err) {
      console.warn(`SQL Server connection failed: ${err.message}`);
      console.warn('Using mock database connection');
      isSqlServerAvailable = false;
      return mockDb.getConnection();
    }
  } else {
    return mockDb.getConnection();
  }
}

/**
 * Read and execute SQL statements from the database.sql file
 */
async function createSchemaFromSqlFile() {
  try {
    // Path to the SQL file - adjust the path as needed to reach database.sql
    const sqlFilePath = path.resolve(__dirname, '../../../database.sql');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    // This splits on semicolons but ignores those within comments
    const statements = sqlContent
      .replace(/--.*$/gm, '') // Remove single line comments
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Get a database connection
    let connection;
    try {
      connection = await getConnection();
    } catch (err) {
      console.error('Failed to get database connection:', err.message);
      return;
    }
    
    try {
      // Extract table names from CREATE TABLE statements
      const createTableStatements = statements
        .filter(stmt => stmt.toUpperCase().includes('CREATE TABLE'))
        .map(stmt => {
          // Extract table name from CREATE TABLE statement
          const tableNameMatch = stmt.match(/CREATE\s+TABLE\s+(\w+)/i);
          return tableNameMatch ? { 
            tableName: tableNameMatch[1], 
            statement: stmt.trim() 
          } : null;
        })
        .filter(item => item !== null);
      
      // Check which tables exist
      console.log('Checking existing tables...');
      for (const item of createTableStatements) {
        try {
          // SQL Server uses INFORMATION_SCHEMA.TABLES instead of USER_TABLES
          const checkTableQuery = `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${item.tableName}'`;
          
          const result = await connection.request().query(checkTableQuery);
          const count = result.recordset ? result.recordset[0].count : 0;
          
          if (count > 0) {
            console.log(`Table ${item.tableName} already exists, skipping creation`);
          } else {
            console.log(`Creating table ${item.tableName}`);
            await connection.request().query(item.statement);
          }
        } catch (err) {
          console.error(`Error checking/creating table ${item.tableName}:`, err.message);
        }
      }
      
      // Execute any remaining non-CREATE TABLE statements
      const otherStatements = statements.filter(stmt => !stmt.toUpperCase().includes('CREATE TABLE'));
      for (let i = 0; i < otherStatements.length; i++) {
        const statement = otherStatements[i].trim();
        if (statement) {
          try {
            await connection.request().query(statement);
            console.log(`Executed non-CREATE TABLE statement ${i + 1}/${otherStatements.length}`);
          } catch (err) {
            console.error(`Error executing statement:`, err.message);
            console.error('Statement:', statement);
          }
        }
      }
      
      console.log('Database schema created/updated successfully');
    } finally {
      // We don't close the connection as we're using pooling
    }
  } catch (err) {
    console.error('Error creating database schema:', err);
  }
}

module.exports = {
  initialize,
  getConnection,
  createSchemaFromSqlFile,
  isSqlServerAvailable: () => isSqlServerAvailable
}; 