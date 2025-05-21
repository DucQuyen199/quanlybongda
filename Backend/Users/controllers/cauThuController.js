const db = require('../config/database');

// Get all players
exports.getAllCauThu = async (req, res) => {
  try {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .query('SELECT * FROM CauThu ORDER BY HoTen');
      
      res.json({ cauThu: result.recordset });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get player by ID
exports.getCauThuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM CauThu WHERE MaCauThu = @id');
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy cầu thủ' });
      }
      
      res.json({ cauThu: result.recordset[0] });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 