const bcrypt = require('bcryptjs');
const db = require('../config/database');

class UserModel {
  static async findByUsername(username) {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('username', username)
        .query('SELECT * FROM NguoiDung WHERE TenDangNhap = @username');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by username:', err);
      throw err;
    }
  }

  static async findById(userId) {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT * FROM NguoiDung WHERE MaND = @userId');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }

  static async create(userData) {
    const pool = await db.getConnection();
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate a new user ID (you might have a different strategy)
      const userIdPrefix = 'ND';
      const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const userId = `${userIdPrefix}${randomId}`;
      
      const result = await pool.request()
        .input('userId', userId)
        .input('fullName', userData.fullName)
        .input('username', userData.username)
        .input('password', hashedPassword)
        .input('role', 'USER')
        .query(`
          INSERT INTO NguoiDung (MaND, HoTen, TenDangNhap, MatKhau, VaiTro) 
          VALUES (@userId, @fullName, @username, @password, @role);
          SELECT MaND FROM NguoiDung WHERE MaND = @userId;
        `);
      
      const insertedId = result.recordset[0]?.MaND || userId;
      
      return {
        maND: insertedId,
        hoTen: userData.fullName,
        tenDangNhap: userData.username,
        vaiTro: 'USER'
      };
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async updateProfile(userId, userData) {
    const pool = await db.getConnection();
    
    try {
      const updates = [];
      const params = new Map();
      
      params.set('userId', userId);

      if (userData.fullName) {
        updates.push('HoTen = @fullName');
        params.set('fullName', userData.fullName);
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updates.push('MatKhau = @password');
        params.set('password', hashedPassword);
      }

      if (updates.length === 0) {
        return null;
      }

      const query = `UPDATE NguoiDung SET ${updates.join(', ')} WHERE MaND = @userId`;
      
      const request = pool.request();
      
      // Add all parameters to the request
      for (const [key, value] of params.entries()) {
        request.input(key, value);
      }
      
      await request.query(query);
      
      return await this.findById(userId);
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  }
}

module.exports = UserModel; 