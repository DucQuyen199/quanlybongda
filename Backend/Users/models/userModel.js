const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

class UserModel {
  static async findByUsername(username) {
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM NguoiDung WHERE TenDangNhap = :username`,
        { username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0];
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  static async findById(userId) {
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM NguoiDung WHERE MaND = :userId`,
        { userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0];
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  static async create(userData) {
    const connection = await db.getConnection();
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate a new user ID (you might have a different strategy)
      const userIdPrefix = 'ND';
      const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const userId = `${userIdPrefix}${randomId}`;
      
      const result = await connection.execute(
        `INSERT INTO NguoiDung (MaND, HoTen, TenDangNhap, MatKhau, VaiTro) 
         VALUES (:userId, :fullName, :username, :password, :role)
         RETURNING MaND INTO :returnId`,
        { 
          userId,
          fullName: userData.fullName,
          username: userData.username,
          password: hashedPassword,
          role: 'USER',
          returnId: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        }
      );
      
      await connection.commit();
      
      return {
        maND: result.outBinds.returnId[0],
        hoTen: userData.fullName,
        tenDangNhap: userData.username,
        vaiTro: 'USER'
      };
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  static async updateProfile(userId, userData) {
    const connection = await db.getConnection();
    
    try {
      const updates = [];
      const binds = { userId };

      if (userData.fullName) {
        updates.push('HoTen = :fullName');
        binds.fullName = userData.fullName;
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updates.push('MatKhau = :password');
        binds.password = hashedPassword;
      }

      if (updates.length === 0) {
        return null;
      }

      const query = `UPDATE NguoiDung SET ${updates.join(', ')} WHERE MaND = :userId`;
      
      await connection.execute(query, binds);
      await connection.commit();
      
      return await this.findById(userId);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}

module.exports = UserModel; 