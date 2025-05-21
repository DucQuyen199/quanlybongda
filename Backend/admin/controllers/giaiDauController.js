const db = require('../config/database');

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
    
    // Delete tournament
    await db.query(`DELETE FROM GiaiDau WHERE MaGiaiDau = @param0`, [id]);
    
    res.status(200).json({ message: 'Tournament deleted successfully.' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ message: 'Server error while deleting tournament.' });
  }
}; 