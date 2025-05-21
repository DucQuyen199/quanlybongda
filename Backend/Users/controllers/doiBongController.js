const db = require('../config/database');
const oracledb = require('oracledb');

// Get all teams
exports.getAllDoiBong = async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM DoiBong ORDER BY HoTen`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      res.json({ doiBong: result.rows });
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
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get team by ID
exports.getDoiBongById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM DoiBong WHERE MaCauThu = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đội bóng' });
      }
      
      res.json({ doiBong: result.rows[0] });
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
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 