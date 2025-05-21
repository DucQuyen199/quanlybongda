const db = require('../config/database');

/**
 * Get all teams with pagination, search and filtering
 */
exports.getAllDoiBong = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query using positional parameters
    let query = `
      SELECT MaDoi, TenDoi, FORMAT(NgayThanhLap, 'yyyy-MM-dd') as NgayThanhLap, SoLuongCauThu, Logo
      FROM DoiBong
      WHERE TenDoi LIKE '%' + @param0 + '%'
    `;
    
    const queryParams = [search];
    
    // Get count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM DoiBong WHERE TenDoi LIKE '%' + @param0 + '%'`;
    const countResult = await db.query(countQuery, [search]);
    const total = countResult.recordset[0].total;
    
    // Add pagination and ordering
    query += ` ORDER BY TenDoi ASC OFFSET @param${queryParams.length} ROWS FETCH NEXT @param${queryParams.length + 1} ROWS ONLY`;
    queryParams.push(offset, parseInt(limit));
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      teams: result.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      message: 'Server error while retrieving teams.', 
      error: error.message 
    });
  }
};

/**
 * Get team by ID
 */
exports.getDoiBongById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT MaDoi, TenDoi, FORMAT(NgayThanhLap, 'yyyy-MM-dd') as NgayThanhLap, SoLuongCauThu, Logo
      FROM DoiBong 
      WHERE MaDoi = @param0
    `, [id]);
    
    const team = result.recordset[0];
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    res.status(200).json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error while retrieving team.' });
  }
};

/**
 * Create new team
 */
exports.createDoiBong = async (req, res) => {
  try {
    const { maDoi, tenDoi, ngayThanhLap, soLuongCauThu, logo } = req.body;
    
    // Validate required fields
    if (!maDoi || !tenDoi) {
      return res.status(400).json({ message: 'Team ID and name are required.' });
    }
    
    // Check if team ID already exists
    const checkResult = await db.query(`
      SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
    `, [maDoi]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Team ID already exists.' });
    }
    
    // Insert new team
    await db.query(`
      INSERT INTO DoiBong (MaDoi, TenDoi, NgayThanhLap, SoLuongCauThu, Logo)
      VALUES (@param0, @param1, @param2, @param3, @param4)
    `, [maDoi, tenDoi, ngayThanhLap || null, soLuongCauThu || 0, logo || null]);
    
    res.status(201).json({ 
      message: 'Team created successfully.',
      data: { maDoi, tenDoi, ngayThanhLap, soLuongCauThu, logo }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error while creating team.' });
  }
};

/**
 * Update team by ID
 */
exports.updateDoiBong = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenDoi, ngayThanhLap, soLuongCauThu, logo } = req.body;
    
    // Check if team exists
    const checkResult = await db.query(`
      SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Update team
    await db.query(`
      UPDATE DoiBong 
      SET TenDoi = @param1, 
          NgayThanhLap = @param2, 
          SoLuongCauThu = @param3, 
          Logo = @param4
      WHERE MaDoi = @param0
    `, [id, tenDoi, ngayThanhLap || null, soLuongCauThu || 0, logo || null]);
    
    res.status(200).json({ 
      message: 'Team updated successfully.',
      data: { maDoi: id, tenDoi, ngayThanhLap, soLuongCauThu, logo }
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error while updating team.' });
  }
};

/**
 * Delete team by ID
 */
exports.deleteDoiBong = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if team exists
    const checkResult = await db.query(`
      SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Check for related records in tournaments or matches
    const tournamentResult = await db.query(`
      SELECT COUNT(*) as count FROM GiaiDau_DoiBong WHERE MaDoi = @param0
    `, [id]);
    
    const matchesResult = await db.query(`
      SELECT COUNT(*) as count FROM TranDau WHERE MaDoiNha = @param0 OR MaDoiKhach = @param0
    `, [id]);
    
    // Provide details if there are related records
    if (tournamentResult.recordset[0].count > 0 || matchesResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with existing tournament or match relationships.',
        details: {
          tournamentsCount: tournamentResult.recordset[0].count,
          matchesCount: matchesResult.recordset[0].count
        }
      });
    }
    
    // Delete team
    await db.query(`DELETE FROM DoiBong WHERE MaDoi = @param0`, [id]);
    
    res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error while deleting team.' });
  }
}; 