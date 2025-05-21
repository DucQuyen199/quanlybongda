const { sequelize } = require('../../admin/config/database');
const { DataTypes } = require('sequelize');

async function syncDatabase() {
  try {
    // Define NguoiDung model
    const NguoiDung = sequelize.define('NguoiDung', {
      MaND: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      HoTen: DataTypes.STRING(100),
      TenDangNhap: DataTypes.STRING(50),
      MatKhau: DataTypes.STRING(100),
      VaiTro: DataTypes.STRING(50)
    }, {
      tableName: 'NguoiDung',
      timestamps: false
    });

    // Define GiaiDau model
    const GiaiDau = sequelize.define('GiaiDau', {
      MaGiaiDau: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      TenGiai: DataTypes.STRING(100),
      ThoiGianBatDau: DataTypes.DATE,
      ThoiGianKetThuc: DataTypes.DATE,
      DiaDiem: DataTypes.STRING(100)
    }, {
      tableName: 'GiaiDau',
      timestamps: false
    });

    // Define DoiBong model
    const DoiBong = sequelize.define('DoiBong', {
      MaCauThu: {  // This seems to be a mistake in the schema, should be MaDoiBong
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      HoTen: DataTypes.STRING(100),
      NgaySinh: DataTypes.DATE,
      SoLuongCauThu: DataTypes.INTEGER,
      Logo: DataTypes.STRING(100)
    }, {
      tableName: 'DoiBong',
      timestamps: false
    });

    // Define CauThu model
    const CauThu = sequelize.define('CauThu', {
      MaCauThu: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      HoTen: DataTypes.STRING(100),
      NgaySinh: DataTypes.DATE,
      ViTri: DataTypes.STRING(50),
      SoAo: DataTypes.INTEGER,
      MaDoi: DataTypes.STRING(20)
    }, {
      tableName: 'CauThu',
      timestamps: false
    });

    // Define TranDau model
    const TranDau = sequelize.define('TranDau', {
      MaTran: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      MaDoi1: DataTypes.STRING(20),
      MaDoi2: DataTypes.STRING(20),
      ThoiGianThiDau: DataTypes.DATE,
      SanThiDau: DataTypes.STRING(100),
      Vong: DataTypes.STRING(50)
    }, {
      tableName: 'TranDau',
      timestamps: false
    });

    // Define LichThiDau model
    const LichThiDau = sequelize.define('LichThiDau', {
      MaLich: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      MaGiaiDau: DataTypes.STRING(20),
      MaTran: DataTypes.STRING(20),
      NgayThiDau: DataTypes.DATE
    }, {
      tableName: 'LichThiDau',
      timestamps: false
    });

    // Define KetQua model
    const KetQua = sequelize.define('KetQua', {
      MaTran: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      TiSoDoi1: DataTypes.INTEGER,
      TiSoDoi2: DataTypes.INTEGER,
      GhiChu: DataTypes.STRING(200)
    }, {
      tableName: 'KetQua',
      timestamps: false
    });

    // Define BaoCaoGiai model
    const BaoCaoGiai = sequelize.define('BaoCaoGiai', {
      MaBaoCao: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      MaGiaiDau: DataTypes.STRING(20),
      NoiDungBaoCao: DataTypes.TEXT,
      NgayLap: DataTypes.DATE,
      VaiTro: DataTypes.STRING(50)
    }, {
      tableName: 'BaoCaoGiai',
      timestamps: false
    });

    // Define TranDau_CauThu model
    const TranDau_CauThu = sequelize.define('TranDau_CauThu', {
      MaTran: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      MaCauThu: {
        type: DataTypes.STRING(20),
        primaryKey: true
      }
    }, {
      tableName: 'TranDau_CauThu',
      timestamps: false
    });

    // Set up associations
    DoiBong.hasMany(CauThu, { foreignKey: 'MaDoi' });
    CauThu.belongsTo(DoiBong, { foreignKey: 'MaDoi' });

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('All tables have been synchronized');

  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

// Execute sync
syncDatabase();

module.exports = { syncDatabase }; 