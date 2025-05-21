const db = require('../config/database');

// Get all matches
exports.getAllTranDau = async (req, res) => {
  try {
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .query(`SELECT t.*, d1.TenDoi as TenDoi1, d2.TenDoi as TenDoi2
                FROM TranDau t
                JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
                JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
                ORDER BY t.ThoiGian DESC`);
      
      res.json({ tranDau: result.recordset });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
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
    
    const pool = await db.getConnection();
    try {
      const result = await pool.request()
        .input('id', id)
        .query(`SELECT t.*, d1.TenDoi as TenDoi1, d2.TenDoi as TenDoi2,
                k.TiSoDoi1, k.TiSoDoi2, k.GhiChu
                FROM TranDau t
                JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
                JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
                LEFT JOIN KetQua k ON t.MaTranDau = k.MaTranDau
                WHERE t.MaTranDau = @id`);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
      }
      
      res.json({ tranDau: result.recordset[0] });
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 