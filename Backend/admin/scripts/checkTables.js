/**
 * Script to check database tables and create missing ones
 */
const db = require('../config/database');

// Helper function to check if a table exists
const tableExists = async (tableName) => {
  try {
    const result = await db.query(`
      SELECT OBJECT_ID('${tableName}') as tableID
    `);
    return !!result.recordset[0].tableID;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to create GiaiDau table
const createGiaiDauTable = async () => {
  try {
    await db.query(`
      CREATE TABLE GiaiDau (
        MaGiaiDau VARCHAR(20) PRIMARY KEY,
        TenGiai NVARCHAR(100) NOT NULL,
        ThoiGianBatDau DATETIME NOT NULL,
        ThoiGianKetThuc DATETIME NOT NULL,
        DiaDiem NVARCHAR(100)
      )
    `);
    console.log('Created GiaiDau table');
  } catch (error) {
    console.error('Error creating GiaiDau table:', error);
  }
};

// Function to create GiaiDau_DoiBong table
const createGiaiDauDoiBongTable = async () => {
  try {
    await db.query(`
      CREATE TABLE GiaiDau_DoiBong (
        MaGiaiDau VARCHAR(20),
        MaDoi VARCHAR(20),
        DiemSo INT DEFAULT 0,
        BanThang INT DEFAULT 0,
        BanThua INT DEFAULT 0,
        PRIMARY KEY (MaGiaiDau, MaDoi),
        FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau)
      )
    `);
    console.log('Created GiaiDau_DoiBong table');
  } catch (error) {
    console.error('Error creating GiaiDau_DoiBong table:', error);
  }
};

// Function to create DoiBong table
const createDoiBongTable = async () => {
  try {
    await db.query(`
      CREATE TABLE DoiBong (
        MaDoi VARCHAR(20) PRIMARY KEY,
        TenDoi NVARCHAR(100) NOT NULL,
        NgayThanhLap DATE,
        SoLuongCauThu INT,
        Logo NVARCHAR(255),
        SanNha NVARCHAR(100)
      )
    `);
    console.log('Created DoiBong table');
  } catch (error) {
    console.error('Error creating DoiBong table:', error);
  }
};

// Function to create TranDau table
const createTranDauTable = async () => {
  try {
    await db.query(`
      CREATE TABLE TranDau (
        MaTranDau VARCHAR(20) PRIMARY KEY,
        MaGiaiDau VARCHAR(20),
        MaDoiNha VARCHAR(20),
        MaDoiKhach VARCHAR(20),
        BanThangDoiNha INT,
        BanThangDoiKhach INT,
        ThoiGian DATETIME,
        DiaDiem NVARCHAR(100),
        TrangThai NVARCHAR(20) DEFAULT 'Scheduled',
        FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
        FOREIGN KEY (MaDoiNha) REFERENCES DoiBong(MaDoi),
        FOREIGN KEY (MaDoiKhach) REFERENCES DoiBong(MaDoi)
      )
    `);
    console.log('Created TranDau table');
  } catch (error) {
    console.error('Error creating TranDau table:', error);
  }
};

// Function to create LichThiDau table
const createLichThiDauTable = async () => {
  try {
    await db.query(`
      CREATE TABLE LichThiDau (
        MaLich VARCHAR(20) PRIMARY KEY,
        MaGiaiDau VARCHAR(20) NOT NULL,
        MaTran VARCHAR(20),
        NgayThiDau DATETIME NOT NULL,
        FOREIGN KEY (MaGiaiDau) REFERENCES GiaiDau(MaGiaiDau),
        FOREIGN KEY (MaTran) REFERENCES TranDau(MaTranDau)
      )
    `);
    console.log('Created LichThiDau table');
  } catch (error) {
    console.error('Error creating LichThiDau table:', error);
  }
};

// Function to create CauThu table
const createCauThuTable = async () => {
  try {
    await db.query(`
      CREATE TABLE CauThu (
        MaCauThu VARCHAR(20) PRIMARY KEY,
        HoTen NVARCHAR(100) NOT NULL,
        NgaySinh DATE,
        ViTri NVARCHAR(50),
        SoAo INT,
        MaDoi VARCHAR(20) NOT NULL,
        FOREIGN KEY (MaDoi) REFERENCES DoiBong(MaDoi)
      )
    `);
    console.log('Created CauThu table');
  } catch (error) {
    console.error('Error creating CauThu table:', error);
  }
};

// Function to create NguoiDung table
const createNguoiDungTable = async () => {
  try {
    await db.query(`
      CREATE TABLE NguoiDung (
        MaND VARCHAR(20) PRIMARY KEY,
        HoTen NVARCHAR(100) NOT NULL,
        TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
        MatKhau NVARCHAR(255) NOT NULL,
        VaiTro NVARCHAR(20) NOT NULL
      )
    `);
    console.log('Created NguoiDung table');
    
    // Create admin user with bcrypt password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.query(`
      INSERT INTO NguoiDung (MaND, HoTen, TenDangNhap, MatKhau, VaiTro)
      VALUES (@param0, @param1, @param2, @param3, @param4)
    `, ['ADMIN001', 'Administrator', 'admin', hashedPassword, 'ADMIN']);
    
    console.log('Added default admin user');
  } catch (error) {
    console.error('Error creating NguoiDung table:', error);
  }
};

// Main function to check and create tables
const checkAndCreateTables = async () => {
  try {
    await db.initialize();
    
    console.log('Checking database tables...');
    
    // Check and create GiaiDau table
    const giaiDauExists = await tableExists('GiaiDau');
    if (!giaiDauExists) {
      await createGiaiDauTable();
    } else {
      console.log('GiaiDau table exists');
    }
    
    // Check and create DoiBong table
    const doiBongExists = await tableExists('DoiBong');
    if (!doiBongExists) {
      await createDoiBongTable();
    } else {
      console.log('DoiBong table exists');
    }
    
    // Check and create GiaiDau_DoiBong table
    const giaiDauDoiBongExists = await tableExists('GiaiDau_DoiBong');
    if (!giaiDauDoiBongExists) {
      await createGiaiDauDoiBongTable();
    } else {
      console.log('GiaiDau_DoiBong table exists');
    }
    
    // Check and create TranDau table
    const tranDauExists = await tableExists('TranDau');
    if (!tranDauExists) {
      await createTranDauTable();
    } else {
      console.log('TranDau table exists');
    }
    
    // Check and create LichThiDau table
    const lichThiDauExists = await tableExists('LichThiDau');
    if (!lichThiDauExists) {
      await createLichThiDauTable();
    } else {
      console.log('LichThiDau table exists');
    }
    
    // Check and create CauThu table
    const cauThuExists = await tableExists('CauThu');
    if (!cauThuExists) {
      await createCauThuTable();
    } else {
      console.log('CauThu table exists');
    }
    
    // Check and create NguoiDung table
    const nguoiDungExists = await tableExists('NguoiDung');
    if (!nguoiDungExists) {
      await createNguoiDungTable();
    } else {
      console.log('NguoiDung table exists');
    }
    
    console.log('Database table check completed');
    
  } catch (error) {
    console.error('Error checking and creating tables:', error);
  } finally {
    console.log('Closing database connection');
    await db.close();
  }
};

// Execute the function
checkAndCreateTables(); 