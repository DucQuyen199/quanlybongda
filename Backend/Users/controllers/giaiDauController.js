const db = require('../config/database');

// Get all tournaments
exports.getAllGiaiDau = async (req, res) => {
  try {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .query('SELECT * FROM GiaiDau ORDER BY ThoiGianBatDau DESC');
      
      res.json({ giaiDau: result.recordset });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
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
    
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM GiaiDau WHERE MaGiaiDau = @id');
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giải đấu' });
      }
      
      res.json({ giaiDau: result.recordset[0] });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 