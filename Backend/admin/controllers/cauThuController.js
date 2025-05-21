const db = require('../config/database');

/**
 * Get all players
 */
exports.getAllPlayers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.MaCauThu, c.HoTen, c.NgaySinh, c.ViTri, c.SoAo, c.MaDoi,
             d.HoTen as TenDoi
      FROM CauThu c
      LEFT JOIN DoiBong d ON c.MaDoi = d.MaCauThu
      ORDER BY d.HoTen, c.HoTen
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Server error while retrieving players.' });
  }
};

/**
 * Get player by ID
 */
exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT c.MaCauThu, c.HoTen, c.NgaySinh, c.ViTri, c.SoAo, c.MaDoi,
             d.HoTen as TenDoi
      FROM CauThu c
      LEFT JOIN DoiBong d ON c.MaDoi = d.MaCauThu
      WHERE c.MaCauThu = @param0
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
exports.createPlayer = async (req, res) => {
  try {
    const { maCauThu, hoTen, ngaySinh, viTri, soAo, maDoi } = req.body;
    
    // Validate required fields
    if (!maCauThu || !hoTen || !maDoi) {
      return res.status(400).json({ message: 'Player ID, name, and team ID are required.' });
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
      SELECT MaCauThu FROM DoiBong WHERE MaCauThu = @param0
    `, [maDoi]);
    
    if (teamResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    
    // Insert new player
    await db.query(`
      INSERT INTO CauThu (MaCauThu, HoTen, NgaySinh, ViTri, SoAo, MaDoi)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5)
    `, [maCauThu, hoTen, ngaySinh || null, viTri || null, soAo || null, maDoi]);
    
    // Update team player count
    await db.query(`
      UPDATE DoiBong
      SET SoLuongCauThu = (
        SELECT COUNT(*) FROM CauThu WHERE MaDoi = @param0
      )
      WHERE MaCauThu = @param0
    `, [maDoi]);
    
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
exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { hoTen, ngaySinh, viTri, soAo, maDoi } = req.body;
    
    // Check if player exists
    const checkResult = await db.query(`
      SELECT MaCauThu, MaDoi FROM CauThu WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    
    const oldTeamId = checkResult.recordset[0].MaDoi;
    
    // If team is being changed, check if new team exists
    if (maDoi && maDoi !== oldTeamId) {
      const teamResult = await db.query(`
        SELECT MaCauThu FROM DoiBong WHERE MaCauThu = @param0
      `, [maDoi]);
      
      if (teamResult.recordset.length === 0) {
        return res.status(404).json({ message: 'New team not found.' });
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
    `, [id, hoTen, ngaySinh, viTri, soAo, maDoi]);
    
    // Update player counts for old and new teams
    if (oldTeamId) {
      await db.query(`
        UPDATE DoiBong
        SET SoLuongCauThu = (
          SELECT COUNT(*) FROM CauThu WHERE MaDoi = @param0
        )
        WHERE MaCauThu = @param0
      `, [oldTeamId]);
    }
    
    if (maDoi && maDoi !== oldTeamId) {
      await db.query(`
        UPDATE DoiBong
        SET SoLuongCauThu = (
          SELECT COUNT(*) FROM CauThu WHERE MaDoi = @param0
        )
        WHERE MaCauThu = @param0
      `, [maDoi]);
    }
    
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
exports.deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if player exists
    const checkResult = await db.query(`
      SELECT MaCauThu, MaDoi FROM CauThu WHERE MaCauThu = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    
    const teamId = checkResult.recordset[0].MaDoi;
    
    // Delete player
    await db.query(`DELETE FROM CauThu WHERE MaCauThu = @param0`, [id]);
    
    // Update team player count
    if (teamId) {
      await db.query(`
        UPDATE DoiBong
        SET SoLuongCauThu = (
          SELECT COUNT(*) FROM CauThu WHERE MaDoi = @param0
        )
        WHERE MaCauThu = @param0
      `, [teamId]);
    }
    
    res.status(200).json({ message: 'Player deleted successfully.' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Server error while deleting player.' });
  }
}; 