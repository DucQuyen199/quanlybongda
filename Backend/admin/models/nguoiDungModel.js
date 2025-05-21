const { DataTypes } = require('sequelize');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Define NguoiDung model
const NguoiDung = db.sequelize.define('NguoiDung', {
  MaND: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  TenDangNhap: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  MatKhau: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  VaiTro: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'NguoiDungs',
  timestamps: false
});

class NguoiDungModel {
  static async getAll() {
    const users = await NguoiDung.findAll({
      attributes: ['MaND', 'HoTen', 'TenDangNhap', 'VaiTro']
    });
    return users;
  }

  static async getById(id) {
    const user = await NguoiDung.findByPk(id, {
      attributes: ['MaND', 'HoTen', 'TenDangNhap', 'VaiTro']
    });
    return user;
  }

  static async getByUsername(username) {
    const user = await NguoiDung.findOne({
      where: {
        TenDangNhap: username
      }
    });
    return user;
  }

  static async create(nguoiDung) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nguoiDung.matKhau, salt);
    
    const result = await NguoiDung.create({
      MaND: nguoiDung.maND,
      HoTen: nguoiDung.hoTen,
      TenDangNhap: nguoiDung.tenDangNhap,
      MatKhau: hashedPassword,
      VaiTro: nguoiDung.vaiTro
    });
    
    return {
      rowsAffected: result ? 1 : 0
    };
  }

  static async update(id, nguoiDung) {
    const updateData = {
      HoTen: nguoiDung.hoTen,
      TenDangNhap: nguoiDung.tenDangNhap,
      VaiTro: nguoiDung.vaiTro
    };
    
    // If password is provided, update it as well
    if (nguoiDung.matKhau) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(nguoiDung.matKhau, salt);
      updateData.MatKhau = hashedPassword;
    }
    
    const result = await NguoiDung.update(updateData, {
      where: { MaND: id }
    });
    
    return {
      rowsAffected: result[0]
    };
  }

  static async delete(id) {
    const result = await NguoiDung.destroy({
      where: { MaND: id }
    });
    
    return {
      rowsAffected: result
    };
  }
  
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = NguoiDungModel; 