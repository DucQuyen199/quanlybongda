const db = require('../config/database');
const oracledb = require('oracledb');

// Get all tournaments
exports.getAllGiaiDau = async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM GiaiDau ORDER BY ThoiGianBatDau DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      res.json({ giaiDau: result.rows });
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
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get tournament by ID
exports.getGiaiDauById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM GiaiDau WHERE MaGiaiDau = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giải đấu' });
      }
      
      res.json({ giaiDau: result.rows[0] });
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
    console.error('Error fetching tournament:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 