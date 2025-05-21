const db = require('../config/database');
const sql = require('mssql');

/**
 * Get all tournaments
 */
exports.getAllGiaiDau = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem 
      FROM GiaiDau 
      ORDER BY ThoiGianBatDau DESC
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ message: 'Server error while retrieving tournaments.' });
  }
};

/**
 * Get tournament by ID
 */
exports.getGiaiDauById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem 
      FROM GiaiDau 
      WHERE MaGiaiDau = @param0
    `, [id]);
    
    const giaiDau = result.recordset[0];
    
    if (!giaiDau) {
      return res.status(404).json({ message: 'Tournament not found.' });
    }
    
    res.status(200).json(giaiDau);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ message: 'Server error while retrieving tournament.' });
  }
};

/**
 * Get tournament details with teams and matches for admin app
 */
exports.getGiaiDauDetailForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tournament details
    const giaiDauResult = await db.query(`
      SELECT MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem 
      FROM GiaiDau 
      WHERE MaGiaiDau = @param0
    `, [id]);
    
    const giaiDau = giaiDauResult.recordset[0];
    
    if (!giaiDau) {
      return res.status(404).json({ message: 'Tournament not found.' });
    }
    
    // Initialize teams and matches as empty arrays
    let teams = [];
    let matches = [];
    
    try {
      // Get teams in this tournament (with error handling)
      const teamsResult = await db.query(`
        SELECT d.MaCauThu as MaDoi, d.HoTen as TenDoi, d.Logo, gdd.DiemSo, gdd.BanThang, gdd.BanThua
        FROM DoiBong d
        JOIN GiaiDau_DoiBong gdd ON d.MaDoi = gdd.MaDoi
        WHERE gdd.MaGiaiDau = @param0
        ORDER BY gdd.DiemSo DESC, (gdd.BanThang - gdd.BanThua) DESC
      `, [id]);
      
      teams = teamsResult.recordset;
    } catch (teamError) {
      console.error('Error fetching teams for tournament:', teamError);
      // Continue execution instead of failing completely
    }
    
    try {
      // Get matches in this tournament (with error handling)
      const matchesResult = await db.query(`
        SELECT t.MaTranDau, t.MaGiaiDau, t.MaDoiNha, d1.HoTen as TenDoiNha, 
               t.MaDoiKhach, d2.HoTen as TenDoiKhach, t.BanThangDoiNha, t.BanThangDoiKhach,
               t.ThoiGian, t.DiaDiem, t.TrangThai
        FROM TranDau t
        JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
        JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
        WHERE t.MaGiaiDau = @param0
        ORDER BY t.ThoiGian DESC
      `, [id]);
      
      matches = matchesResult.recordset;
    } catch (matchError) {
      console.error('Error fetching matches for tournament:', matchError);
      // Continue execution instead of failing completely
    }
    
    // Respond with complete tournament data
    res.status(200).json({
      tournamentDetails: giaiDau,
      teams: teams,
      matches: matches
    });
  } catch (error) {
    console.error('Error fetching tournament details for admin:', error);
    res.status(500).json({ 
      message: 'Server error while retrieving tournament details.',
      error: error.message
    });
  }
};

/**
 * Get paginated tournaments with filtering for admin app
 */
exports.getPaginatedGiaiDau = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query using positional parameters instead of named parameters
    let query = `
      SELECT MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem
      FROM GiaiDau
      WHERE TenGiai LIKE '%' + @param0 + '%'
    `;
    
    const queryParams = [search];
    
    // Add status filtering if requested
    if (status) {
      const currentDate = new Date().toISOString();
      
      if (status === 'active') {
        query += ` AND ThoiGianBatDau <= @param1 AND ThoiGianKetThuc >= @param1`;
        queryParams.push(currentDate);
      } else if (status === 'upcoming') {
        query += ` AND ThoiGianBatDau > @param1`;
        queryParams.push(currentDate);
      } else if (status === 'completed') {
        query += ` AND ThoiGianKetThuc < @param1`;
        queryParams.push(currentDate);
      }
    }
    
    // Get count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM GiaiDau WHERE TenGiai LIKE '%' + @param0 + '%'`;
    const countResult = await db.query(countQuery, [search]);
    const total = countResult.recordset[0].total;
    
    // Add pagination and ordering
    query += ` ORDER BY ThoiGianBatDau DESC OFFSET @param${queryParams.length} ROWS FETCH NEXT @param${queryParams.length + 1} ROWS ONLY`;
    queryParams.push(offset, parseInt(limit));
    
    // Execute query using standard positional parameters
    const result = await db.query(query, queryParams);
    
    // Format the response
    const tournaments = result.recordset.map(tournament => ({
      ...tournament,
      SoDoiBong: 0, // Placeholder since we don't have the GiaiDau_DoiBong table
      SoTranDau: 0  // Placeholder since we're not counting matches
    }));
    
    res.status(200).json({
      tournaments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching paginated tournaments:', error);
    res.status(500).json({ 
      message: 'Server error while retrieving tournaments.', 
      error: error.message 
    });
  }
};

/**
 * Create new tournament
 */
exports.createGiaiDau = async (req, res) => {
  try {
    const { maGiaiDau, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem } = req.body;
    
    // Validate required fields
    if (!maGiaiDau || !tenGiai || !thoiGianBatDau || !thoiGianKetThuc) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Check if tournament ID already exists
    const checkResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [maGiaiDau]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Tournament ID already exists.' });
    }
    
    // Insert new tournament
    await db.query(`
      INSERT INTO GiaiDau (MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem)
      VALUES (@param0, @param1, @param2, @param3, @param4)
    `, [maGiaiDau, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem]);
    
    res.status(201).json({ 
      message: 'Tournament created successfully.',
      data: { maGiaiDau, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem }
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Server error while creating tournament.' });
  }
};

/**
 * Update tournament by ID
 */
exports.updateGiaiDau = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem } = req.body;
    
    // Check if tournament exists
    const checkResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Tournament not found.' });
    }
    
    // Update tournament
    await db.query(`
      UPDATE GiaiDau 
      SET TenGiai = @param1, 
          ThoiGianBatDau = @param2, 
          ThoiGianKetThuc = @param3, 
          DiaDiem = @param4
      WHERE MaGiaiDau = @param0
    `, [id, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem]);
    
    res.status(200).json({ 
      message: 'Tournament updated successfully.',
      data: { maGiaiDau: id, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem }
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ message: 'Server error while updating tournament.' });
  }
};

/**
 * Delete tournament by ID
 */
exports.deleteGiaiDau = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tournament exists
    const checkResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Tournament not found.' });
    }
    
    // Check for related teams and matches
    const teamsResult = await db.query(`
      SELECT COUNT(*) as count FROM GiaiDau_DoiBong WHERE MaGiaiDau = @param0
    `, [id]);
    
    const matchesResult = await db.query(`
      SELECT COUNT(*) as count FROM TranDau WHERE MaGiaiDau = @param0
    `, [id]);
    
    // Provide details if there are related records
    if (teamsResult.recordset[0].count > 0 || matchesResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tournament with existing teams or matches.',
        details: {
          teamsCount: teamsResult.recordset[0].count,
          matchesCount: matchesResult.recordset[0].count
        }
      });
    }
    
    // Delete tournament
    await db.query(`DELETE FROM GiaiDau WHERE MaGiaiDau = @param0`, [id]);
    
    res.status(200).json({ message: 'Tournament deleted successfully.' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ message: 'Server error while deleting tournament.' });
  }
};

/**
 * Add team to tournament
 */
exports.addTeamToTournament = async (req, res) => {
  try {
    const { maGiaiDau, maDoi } = req.body;
    
    // Validate required fields
    if (!maGiaiDau || !maDoi) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Check if tournament exists
    const tournamentResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [maGiaiDau]);
    
    if (tournamentResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Tournament not found.' });
    }
    
    // Check if team exists - using MaDoi which is the actual column name
    const teamResult = await db.query(`
      SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
    `, [maDoi]);
    
    if (teamResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Check if team is already in tournament
    const checkResult = await db.query(`
      SELECT * FROM GiaiDau_DoiBong WHERE MaGiaiDau = @param0 AND MaDoi = @param1
    `, [maGiaiDau, maDoi]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Team is already in this tournament.' });
    }
    
    // Add team to tournament with initial stats
    await db.query(`
      INSERT INTO GiaiDau_DoiBong (MaGiaiDau, MaDoi, DiemSo, BanThang, BanThua)
      VALUES (@param0, @param1, 0, 0, 0)
    `, [maGiaiDau, maDoi]);
    
    res.status(201).json({ 
      message: 'Team added to tournament successfully.',
      data: { maGiaiDau, maDoi }
    });
  } catch (error) {
    console.error('Error adding team to tournament:', error);
    res.status(500).json({ message: 'Server error while adding team to tournament.' });
  }
};

/**
 * Remove team from tournament
 */
exports.removeTeamFromTournament = async (req, res) => {
  try {
    const { maGiaiDau, maDoi } = req.params;
    
    // Check if team is in tournament
    const checkResult = await db.query(`
      SELECT * FROM GiaiDau_DoiBong WHERE MaGiaiDau = @param0 AND MaDoi = @param1
    `, [maGiaiDau, maDoi]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found in this tournament.' });
    }
    
    // Check if team has matches in tournament
    const matchesResult = await db.query(`
      SELECT COUNT(*) as count FROM TranDau 
      WHERE MaGiaiDau = @param0 AND (MaDoiNha = @param1 OR MaDoiKhach = @param1)
    `, [maGiaiDau, maDoi]);
    
    if (matchesResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot remove team with existing matches in tournament.',
        matchesCount: matchesResult.recordset[0].count
      });
    }
    
    // Remove team from tournament
    await db.query(`
      DELETE FROM GiaiDau_DoiBong WHERE MaGiaiDau = @param0 AND MaDoi = @param1
    `, [maGiaiDau, maDoi]);
    
    res.status(200).json({ message: 'Team removed from tournament successfully.' });
  } catch (error) {
    console.error('Error removing team from tournament:', error);
    res.status(500).json({ message: 'Server error while removing team from tournament.' });
  }
}; 