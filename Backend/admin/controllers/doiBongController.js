const db = require('../config/database');

/**
 * Get all teams
 */
exports.getAllTeams = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT MaCauThu AS MaDoi, HoTen, NgaySinh, SoLuongCauThu, Logo 
      FROM DoiBong
      ORDER BY HoTen
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error while retrieving teams.' });
  }
};

/**
 * Get team by ID
 */
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT MaCauThu AS MaDoi, HoTen, NgaySinh, SoLuongCauThu, Logo 
      FROM DoiBong 
      WHERE MaCauThu = @param0
    `, [id]);
    
    const team = result.recordset[0];
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Get players in the team
    const playersResult = await db.query(`
      SELECT MaCauThu, HoTen, NgaySinh, ViTri, SoAo
      FROM CauThu
      WHERE MaDoi = @param0
    `, [id]);
    
    team.players = playersResult.recordset;
    
    res.status(200).json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error while retrieving team.' });
  }
};

/**
 * Create new team
 */
exports.createTeam = async (req, res) => {
  try {
    const { maDoi, hoTen, ngaySinh, soLuongCauThu, logo } = req.body;
    
    // Validate required fields
    if (!maDoi || !hoTen) {
      return res.status(400).json({ message: 'Team ID and name are required.' });
    }
    
    // Check if team ID already exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM DoiBong WHERE MaCauThu = @param0
    `, [maDoi]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Team ID already exists.' });
    }
    
    // Insert new team
    await db.query(`
      INSERT INTO DoiBong (MaCauThu, HoTen, NgaySinh, SoLuongCauThu, Logo)
      VALUES (@param0, @param1, @param2, @param3, @param4)
    `, [maDoi, hoTen, ngaySinh || null, soLuongCauThu || 0, logo || null]);
    
    res.status(201).json({ 
      message: 'Team created successfully.',
      data: { maDoi, hoTen, ngaySinh, soLuongCauThu, logo }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error while creating team.' });
  }
};

/**
 * Update team by ID
 */
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { hoTen, ngaySinh, soLuongCauThu, logo } = req.body;
    
    // Check if team exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM DoiBong WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Update team
    await db.query(`
      UPDATE DoiBong 
      SET HoTen = @param1, 
          NgaySinh = @param2, 
          SoLuongCauThu = @param3, 
          Logo = @param4
      WHERE MaCauThu = @param0
    `, [id, hoTen, ngaySinh, soLuongCauThu, logo]);
    
    res.status(200).json({ 
      message: 'Team updated successfully.',
      data: { maDoi: id, hoTen, ngaySinh, soLuongCauThu, logo }
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error while updating team.' });
  }
};

/**
 * Delete team by ID
 */
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if team exists
    const checkResult = await db.query(`
      SELECT MaCauThu FROM DoiBong WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Check if team has players
    const playersResult = await db.query(`
      SELECT COUNT(*) as count FROM CauThu WHERE MaDoi = @param0
    `, [id]);
    
    if (playersResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with players. Remove players first.' 
      });
    }
    
    // Delete team
    await db.query(`DELETE FROM DoiBong WHERE MaCauThu = @param0`, [id]);
    
    res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error while deleting team.' });
  }
}; 