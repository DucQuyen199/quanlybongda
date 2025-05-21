const db = require('../config/database');

/**
 * Get all schedules with pagination
 */
exports.getAllLichThiDau = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    console.log('Fetching schedules with params:', { page, limit, offset, search });
    
    // Get total count for pagination
    const countResult = await db.query(`
      SELECT COUNT(*) AS total FROM LichThiDau
    `);
    
    const totalCount = countResult.recordset[0].total;
    
    // Query with pagination
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
      ORDER BY l.NgayThiDau DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `);
    
    console.log(`Found ${result.recordset.length} schedules out of ${totalCount} total`);
    
    // Format the result for the frontend
    const schedules = result.recordset.map(item => ({
      id: item.MaLich,
      MaLich: item.MaLich,
      MaGiaiDau: item.MaGiaiDau,
      TenGiai: item.TenGiai,
      MaTran: item.MaTran,
      MaDoiNha: item.MaDoiNha,
      TenDoiNha: item.TenDoiNha,
      MaDoiKhach: item.MaDoiKhach,
      TenDoiKhach: item.TenDoiKhach,
      NgayThiDau: item.NgayThiDau
    }));
    
    res.status(200).json({
      data: schedules,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      message: 'Error fetching schedules', 
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
    
    console.log('Schedule create request:', {
      maLich, maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach
    });
    
    // Validate required fields
    if (!maLich || !maGiaiDau || !ngayThiDau) {
      console.log('Missing required fields:', { maLich, maGiaiDau, ngayThiDau });
      return res.status(400).json({ message: 'Schedule ID, Tournament ID and Date are required.' });
    }
    
    // Check if schedule ID already exists
    const checkResult = await db.query(`
      SELECT MaLich FROM LichThiDau WHERE MaLich = @param0
    `, [maLich]);
    
    if (checkResult.recordset.length > 0) {
      console.log('Schedule ID already exists:', maLich);
      return res.status(409).json({ message: 'Schedule ID already exists.' });
    }
    
    // Check if tournament ID exists
    const tournamentResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [maGiaiDau]);
    
    if (tournamentResult.recordset.length === 0) {
      console.log('Tournament not found:', maGiaiDau);
      return res.status(400).json({ message: 'Tournament not found.' });
    }
    
    // If team IDs are provided, check if they exist
    if (maDoiNha) {
      const homeTeamResult = await db.query(`
        SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
      `, [maDoiNha]);
      
      if (homeTeamResult.recordset.length === 0) {
        console.log('Home team not found:', maDoiNha);
        return res.status(400).json({ message: 'Home team not found.' });
      }
    }
    
    if (maDoiKhach) {
      const awayTeamResult = await db.query(`
        SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
      `, [maDoiKhach]);
      
      if (awayTeamResult.recordset.length === 0) {
        console.log('Away team not found:', maDoiKhach);
        return res.status(400).json({ message: 'Away team not found.' });
      }
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
      } else if (matchId) {
        // Check if the match ID exists
        const matchExists = await db.query(`
          SELECT MaTranDau FROM TranDau WHERE MaTranDau = @param0
        `, [matchId], { transaction });
        
        if (matchExists.recordset.length === 0) {
          // Rollback and return error
          await db.rollbackTransaction(transaction);
          return res.status(400).json({ message: 'Match ID does not exist.' });
        }
      } else {
        // If no match ID and no teams provided, don't link to any match
        matchId = null;
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
      
      // Check if it's a foreign key error
      if (transactionError.number === 547) {
        console.error('Foreign key constraint error:', transactionError);
        return res.status(400).json({ 
          message: 'Foreign key constraint error. Make sure referenced IDs exist.',
          error: transactionError.message
        });
      }
      
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
      // If a new match ID is provided, check if it exists
      if (maTran && maTran !== existingMaTran) {
        const matchExists = await db.query(`
          SELECT MaTranDau FROM TranDau WHERE MaTranDau = @param0
        `, [maTran], { transaction });
        
        if (matchExists.recordset.length === 0) {
          // Rollback and return error
          await db.rollbackTransaction(transaction);
          return res.status(400).json({ message: 'Match ID does not exist.' });
        }
      }
      
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
      
      // Check if it's a foreign key error
      if (transactionError.number === 547) {
        return res.status(400).json({ 
          message: 'Foreign key constraint error. Make sure referenced IDs exist.',
          error: transactionError.message
        });
      }
      
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