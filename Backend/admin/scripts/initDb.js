const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

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

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../../../database.sql');
    console.log(`Reading SQL schema from ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`Error: SQL file not found at ${sqlFilePath}`);
      process.exit(1);
    }
    
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the script by statements (handling both semicolon and GO separators)
    const batches = sqlScript.split(/\r?\nGO\r?\n|\r?\n*;\r?\n/g)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);
    
    console.log(`Found ${batches.length} SQL batches to execute`);
    
    // Execute each batch one by one
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        console.log(`Executing batch ${i+1}/${batches.length}...`);
        await pool.request().query(batch);
      } catch (error) {
        // Log the error but continue with other batches
        console.error(`Error executing batch ${i+1}:`, error.message);
        console.log('Batch content:', batch);
      }
    }
    
    console.log('Database schema initialized successfully');
    
    // Insert test data if needed
    console.log('Creating admin user...');
    await createAdminUser(pool);
    
    // Close the connection
    await pool.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function createAdminUser(pool) {
  try {
    // Check if user already exists
    const checkResult = await pool.request()
      .query('SELECT * FROM NguoiDung WHERE TenDangNhap = \'admin\'');
    
    if (checkResult.recordset.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user with default password
    await pool.request()
      .input('id', sql.VarChar, 'ADMIN001')
      .input('name', sql.NVarChar, 'Administrator')
      .input('username', sql.NVarChar, 'admin')
      .input('password', sql.VarChar, '$2b$10$Uj2Hn7GxuU5E5FnU1OXQDOYnSzGFGm5WffJMQiKBJ/Ec2P5zJ6bZO') // hashed "admin123"
      .input('role', sql.NVarChar, 'ADMIN')
      .query(`
        INSERT INTO NguoiDung (MaND, HoTen, TenDangNhap, MatKhau, VaiTro) 
        VALUES (@id, @name, @username, @password, @role)
      `);
    
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

console.log('Starting database initialization...');
initializeDatabase(); 