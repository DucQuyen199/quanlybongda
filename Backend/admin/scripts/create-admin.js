const bcrypt = require('bcrypt');
const sql = require('mssql');
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

// Admin user data
const adminUser = {
  id: 'ADMIN001',
  name: 'Administrator',
  username: 'admin',
  password: 'admin123', // This will be hashed before storing
  role: 'ADMIN'
};

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    
    // Check if user already exists
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, adminUser.username)
      .query('SELECT * FROM NguoiDung WHERE TenDangNhap = @username');
    
    if (checkResult.recordset.length > 0) {
      console.log('Admin user already exists');
      await pool.close();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Insert admin user
    await pool.request()
      .input('id', sql.VarChar, adminUser.id)
      .input('name', sql.NVarChar, adminUser.name)
      .input('username', sql.NVarChar, adminUser.username)
      .input('password', sql.VarChar, hashedPassword)
      .input('role', sql.NVarChar, adminUser.role)
      .query(`
        INSERT INTO NguoiDung (MaND, HoTen, TenDangNhap, MatKhau, VaiTro) 
        VALUES (@id, @name, @username, @password, @role)
      `);
    
    console.log('Admin user created successfully');
    console.log('Username:', adminUser.username);
    console.log('Password:', adminUser.password);
    
    await pool.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 