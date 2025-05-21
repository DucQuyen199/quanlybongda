const db = require('../config/database');

/**
 * Get all players with pagination, search and filtering
 */
exports.getAllCauThu = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query using positional parameters
    let query = `
      SELECT MaCauThu, HoTen, FORMAT(NgaySinh, 'yyyy-MM-dd') as NgaySinh, ViTri, SoAo, MaDoi
      FROM CauThu
      WHERE HoTen LIKE '%' + @param0 + '%'
    `;
    
    const queryParams = [search];
    
    // Get count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM CauThu WHERE HoTen LIKE '%' + @param0 + '%'`;
    const countResult = await db.query(countQuery, [search]);
    const total = countResult.recordset[0].total;
    
    // Add pagination and ordering
    query += ` ORDER BY HoTen ASC OFFSET @param${queryParams.length} ROWS FETCH NEXT @param${queryParams.length + 1} ROWS ONLY`;
    queryParams.push(offset, parseInt(limit));
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      players: result.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ 
      message: 'Server error while retrieving players.', 
      error: error.message 
    });
  }
};

/**
 * Get player by ID
 */
exports.getCauThuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT MaCauThu, HoTen, FORMAT(NgaySinh, 'yyyy-MM-dd') as NgaySinh, ViTri, SoAo, MaDoi
      FROM CauThu 
      WHERE MaCauThu = @param0
    `, [id]);
    
    const player = result.recordset[0];
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    
    res.status(200).json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Server error while retrieving player.' });
  }
};

/**
 * Create new player
 */
exports.createCauThu = async (req, res) => {
  try {
    const { maCauThu, hoTen, ngaySinh, viTri, soAo, maDoi } = req.body;
    
    // Validate required fields
    if (!maCauThu || !hoTen || !maDoi) {
      return res.status(400).json({ message: 'Player ID, name and team ID are required.' });
    }
    
    // Check if player ID already exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM CauThu WHERE MaCauThu = @param0
    `, [maCauThu]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Player ID already exists.' });
    }
    
    // Check if team exists
    const teamResult = await db.query(`
      SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
    `, [maDoi]);
    
    if (teamResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Insert new player
    await db.query(`
      INSERT INTO CauThu (MaCauThu, HoTen, NgaySinh, ViTri, SoAo, MaDoi)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5)
    `, [maCauThu, hoTen, ngaySinh || null, viTri || null, soAo || null, maDoi]);
    
    res.status(201).json({ 
      message: 'Player created successfully.',
      data: { maCauThu, hoTen, ngaySinh, viTri, soAo, maDoi }
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ message: 'Server error while creating player.' });
  }
};

/**
 * Update player by ID
 */
exports.updateCauThu = async (req, res) => {
  try {
    const { id } = req.params;
    const { hoTen, ngaySinh, viTri, soAo, maDoi } = req.body;
    
    // Check if player exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM CauThu WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    
    // Check if team exists
    if (maDoi) {
      const teamResult = await db.query(`
        SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
      `, [maDoi]);
      
      if (teamResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Team not found.' });
      }
    }
    
    // Update player
    await db.query(`
      UPDATE CauThu 
      SET HoTen = @param1, 
          NgaySinh = @param2, 
          ViTri = @param3, 
          SoAo = @param4,
          MaDoi = @param5
      WHERE MaCauThu = @param0
    `, [id, hoTen, ngaySinh || null, viTri || null, soAo || null, maDoi]);
    
    res.status(200).json({ 
      message: 'Player updated successfully.',
      data: { maCauThu: id, hoTen, ngaySinh, viTri, soAo, maDoi }
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ message: 'Server error while updating player.' });
  }
};

/**
 * Delete player by ID
 */
exports.deleteCauThu = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if player exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM CauThu WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    
    // Delete player
    await db.query(`DELETE FROM CauThu WHERE MaCauThu = @param0`, [id]);
    
    res.status(200).json({ message: 'Player deleted successfully.' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Server error while deleting player.' });
  }
}; 