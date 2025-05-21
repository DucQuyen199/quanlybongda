const db = require('../config/database');
const oracledb = require('oracledb');

// Get all matches
exports.getAllTranDau = async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT t.*, d1.HoTen as TenDoi1, d2.HoTen as TenDoi2
         FROM TranDau t
         JOIN DoiBong d1 ON t.MaDoi1 = d1.MaCauThu
         JOIN DoiBong d2 ON t.MaDoi2 = d2.MaCauThu
         ORDER BY t.ThoiGianThiDau DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      res.json({ tranDau: result.rows });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get match by ID
exports.getTranDauById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT t.*, d1.HoTen as TenDoi1, d2.HoTen as TenDoi2,
                k.TiSoDoi1, k.TiSoDoi2, k.GhiChu
         FROM TranDau t
         JOIN DoiBong d1 ON t.MaDoi1 = d1.MaCauThu
         JOIN DoiBong d2 ON t.MaDoi2 = d2.MaCauThu
         LEFT JOIN KetQua k ON t.MaTran = k.MaTran
         WHERE t.MaTran = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
      }
      
      res.json({ tranDau: result.rows[0] });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 