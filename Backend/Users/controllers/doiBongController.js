const db = require('../config/database');

// Get all teams
exports.getAllDoiBong = async (req, res) => {
  try {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .query('SELECT * FROM DoiBong ORDER BY HoTen');
      
      res.json({ doiBong: result.recordset });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
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
    
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM DoiBong WHERE MaCauThu = @id');
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đội bóng' });
      }
      
      res.json({ doiBong: result.recordset[0] });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 