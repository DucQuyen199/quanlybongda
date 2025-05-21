const { DataTypes } = require('sequelize');
const db = require('../config/database');

// Define GiaiDau model
const GiaiDau = db.sequelize.define('GiaiDau', {
  MaGiaiDau: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  TenGiai: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ThoiGianBatDau: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ThoiGianKetThuc: {
    type: DataTypes.DATE,
    allowNull: false
  },
  DiaDiem: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'GiaiDaus',
  timestamps: false
});

class GiaiDauModel {
  static async getAll() {
    const giaiDaus = await GiaiDau.findAll({
      order: [['ThoiGianBatDau', 'DESC']]
    });
    return giaiDaus;
  }

  static async getById(id) {
    const giaiDau = await GiaiDau.findByPk(id);
    return giaiDau;
  }

  static async create(giaiDau) {
    const result = await GiaiDau.create({
      MaGiaiDau: giaiDau.maGiaiDau,
      TenGiai: giaiDau.tenGiai,
      ThoiGianBatDau: new Date(giaiDau.thoiGianBatDau),
      ThoiGianKetThuc: new Date(giaiDau.thoiGianKetThuc),
      DiaDiem: giaiDau.diaDiem
    });
    
    return {
      rowsAffected: result ? 1 : 0
    };
  }

  static async update(id, giaiDau) {
    const result = await GiaiDau.update({
      TenGiai: giaiDau.tenGiai,
      ThoiGianBatDau: new Date(giaiDau.thoiGianBatDau),
      ThoiGianKetThuc: new Date(giaiDau.thoiGianKetThuc),
      DiaDiem: giaiDau.diaDiem
    }, {
      where: { MaGiaiDau: id }
    });
    
    return {
      rowsAffected: result[0]
    };
  }

  static async delete(id) {
    const result = await GiaiDau.destroy({
      where: { MaGiaiDau: id }
    });
    
    return {
      rowsAffected: result
    };
  }
}

module.exports = GiaiDauModel; 