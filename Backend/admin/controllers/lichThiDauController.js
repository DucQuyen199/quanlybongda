const db = require('../config/database');

/**
 * Get all schedules with pagination, search and filtering
 */
exports.getAllLichThiDau = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if LichThiDau table exists
    const tableCheckResult = await db.query(`
      SELECT OBJECT_ID('LichThiDau') as tableID
    `);
    
    if (!tableCheckResult.recordset[0].tableID) {
      return res.status(200).json({
        schedules: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        },
        message: 'LichThiDau table does not exist. Please run database setup.'
      });
    }
    
    // Build query using positional parameters
    let query = `
      SELECT l.MaLich, l.MaGiaiDau, g.TenGiai, l.MaTran, 
             t.MaDoiNha, d1.TenDoi as TenDoiNha, 
             t.MaDoiKhach, d2.TenDoi as TenDoiKhach,
             FORMAT(l.NgayThiDau, 'yyyy-MM-dd') as NgayThiDau
      FROM LichThiDau l
      LEFT JOIN GiaiDau g ON l.MaGiaiDau = g.MaGiaiDau
      LEFT JOIN TranDau t ON l.MaTran = t.MaTranDau
      LEFT JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
      LEFT JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
      WHERE l.MaLich LIKE '%' + @param0 + '%' OR g.TenGiai LIKE '%' + @param0 + '%'
    `;
    
    const queryParams = [search];
    
    // Get count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM LichThiDau WHERE MaLich LIKE '%' + @param0 + '%'`;
    const countResult = await db.query(countQuery, [search]);
    const total = countResult.recordset[0].total;
    
    // Add pagination and ordering
    query += ` ORDER BY l.NgayThiDau DESC OFFSET @param${queryParams.length} ROWS FETCH NEXT @param${queryParams.length + 1} ROWS ONLY`;
    queryParams.push(offset, parseInt(limit));
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      schedules: result.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      schedules: [],
      pagination: {
        total: 0,
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10),
        totalPages: 0
      },
      error: error.message
    });
  }
};

/**
 * Get schedule by ID
 */
exports.getLichThiDauById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT l.MaLich, l.MaGiaiDau, g.TenGiai, l.MaTran, 
             t.MaDoiNha, d1.TenDoi as TenDoiNha, 
             t.MaDoiKhach, d2.TenDoi as TenDoiKhach,
             FORMAT(l.NgayThiDau, 'yyyy-MM-dd') as NgayThiDau
      FROM LichThiDau l
      LEFT JOIN GiaiDau g ON l.MaGiaiDau = g.MaGiaiDau
      LEFT JOIN TranDau t ON l.MaTran = t.MaTranDau
      LEFT JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
      LEFT JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
      WHERE l.MaLich = @param0
    `, [id]);
    
    const schedule = result.recordset[0];
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }
    
    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ 
      message: 'Error fetching schedule', 
      error: error.message 
    });
  }
};

/**
 * Create new schedule
 */
exports.createLichThiDau = async (req, res) => {
  try {
    const { maLich, maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach } = req.body;
    
    // Validate required fields
    if (!maLich || !maGiaiDau || !ngayThiDau) {
      return res.status(400).json({ message: 'Schedule ID, Tournament ID and Date are required.' });
    }
    
    // Check if schedule ID already exists
    const checkResult = await db.query(`
      SELECT MaLich FROM LichThiDau WHERE MaLich = @param0
    `, [maLich]);
    
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Schedule ID already exists.' });
    }
    
    // Start a transaction
    const transaction = await db.beginTransaction();
    
    try {
      // If maTran is not provided but we have teams, create a new match
      let matchId = maTran;
      
      if (!matchId && maDoiNha && maDoiKhach) {
        // Generate a match ID
        matchId = `TRAN${Date.now().toString().slice(-6)}`;
        
        // Insert new match
        await db.query(`
          INSERT INTO TranDau (MaTranDau, MaGiaiDau, MaDoiNha, MaDoiKhach, ThoiGian, TrangThai)
          VALUES (@param0, @param1, @param2, @param3, @param4, 'Scheduled')
        `, [matchId, maGiaiDau, maDoiNha, maDoiKhach, ngayThiDau], { transaction });
      }
      
      // Insert new schedule
      await db.query(`
        INSERT INTO LichThiDau (MaLich, MaGiaiDau, MaTran, NgayThiDau)
        VALUES (@param0, @param1, @param2, @param3)
      `, [maLich, maGiaiDau, matchId, ngayThiDau], { transaction });
      
      // Commit the transaction
      await db.commitTransaction(transaction);
      
      res.status(201).json({ 
        message: 'Schedule created successfully.',
        data: { maLich, maGiaiDau, maTran: matchId, ngayThiDau }
      });
    } catch (transactionError) {
      // Rollback in case of error
      await db.rollbackTransaction(transaction);
      throw transactionError;
    }
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ 
      message: 'Error creating schedule', 
      error: error.message 
    });
  }
};

/**
 * Update schedule by ID
 */
exports.updateLichThiDau = async (req, res) => {
  try {
    const { id } = req.params;
    const { maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach } = req.body;
    
    // Check if schedule exists
    const checkResult = await db.query(`
      SELECT MaLich, MaTran FROM LichThiDau WHERE MaLich = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }
    
    const existingMaTran = checkResult.recordset[0].MaTran;
    
    // Start a transaction
    const transaction = await db.beginTransaction();
    
    try {
      // If we have team information and a match ID, update the match
      if (maDoiNha && maDoiKhach && existingMaTran) {
        await db.query(`
          UPDATE TranDau 
          SET MaDoiNha = @param1, 
              MaDoiKhach = @param2,
              ThoiGian = @param3
          WHERE MaTranDau = @param0
        `, [existingMaTran, maDoiNha, maDoiKhach, ngayThiDau], { transaction });
      }
      
      // Update schedule
      await db.query(`
        UPDATE LichThiDau 
        SET MaGiaiDau = @param1, 
            MaTran = @param2, 
            NgayThiDau = @param3
        WHERE MaLich = @param0
      `, [id, maGiaiDau, maTran || existingMaTran, ngayThiDau], { transaction });
      
      // Commit the transaction
      await db.commitTransaction(transaction);
      
      res.status(200).json({ 
        message: 'Schedule updated successfully.',
        data: { maLich: id, maGiaiDau, maTran: maTran || existingMaTran, ngayThiDau }
      });
    } catch (transactionError) {
      // Rollback in case of error
      await db.rollbackTransaction(transaction);
      throw transactionError;
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ 
      message: 'Error updating schedule', 
      error: error.message 
    });
  }
};

/**
 * Delete schedule by ID
 */
exports.deleteLichThiDau = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if schedule exists
    const checkResult = await db.query(`
      SELECT MaLich FROM LichThiDau WHERE MaLich = @param0
    `, [id]);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }
    
    // Delete schedule
    await db.query(`DELETE FROM LichThiDau WHERE MaLich = @param0`, [id]);
    
    res.status(200).json({ message: 'Schedule deleted successfully.' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ 
      message: 'Error deleting schedule', 
      error: error.message 
    });
  }
}; 