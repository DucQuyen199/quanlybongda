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
             FORMAT(l.NgayThiDau, 'yyyy-MM-dd') as NgayThiDau,
             t.BanThangDoiNha, t.BanThangDoiKhach, t.TrangThai
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
      NgayThiDau: item.NgayThiDau,
      BanThangDoiNha: item.BanThangDoiNha,
      BanThangDoiKhach: item.BanThangDoiKhach,
      TrangThai: item.TrangThai || 'Chưa diễn ra'
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
             FORMAT(l.NgayThiDau, 'yyyy-MM-dd') as NgayThiDau,
             t.BanThangDoiNha, t.BanThangDoiKhach, t.TrangThai
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
  // Start a transaction for consistency
  let transaction = null;
  
  try {
    transaction = await db.beginTransaction();
    const { maLich, maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach, banThangDoiNha, banThangDoiKhach, trangThai } = req.body;
    
    console.log('Schedule create request:', {
      maLich, maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach, banThangDoiNha, banThangDoiKhach, trangThai
    });
    
    // Validate required fields
    if (!maLich || !maGiaiDau || !ngayThiDau) {
      console.log('Missing required fields:', { maLich, maGiaiDau, ngayThiDau });
      return res.status(400).json({ message: 'Schedule ID, Tournament ID and Date are required.' });
    }
    
    // Check if schedule ID already exists
    const checkResult = await db.query(`
      SELECT MaLich FROM LichThiDau WHERE MaLich = @param0
    `, [maLich], { transaction });
    
    if (checkResult.recordset.length > 0) {
      console.log('Schedule ID already exists:', maLich);
      await db.rollbackTransaction(transaction);
      return res.status(409).json({ message: 'Schedule ID already exists.' });
    }
    
    // Validate tournament exists
    const tournamentResult = await db.query(`
      SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @param0
    `, [maGiaiDau], { transaction });
    
    if (tournamentResult.recordset.length === 0) {
      console.log('Tournament not found:', maGiaiDau);
      await db.rollbackTransaction(transaction);
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Validate teams if provided
    if (maDoiNha) {
      const homeTeamResult = await db.query(`
        SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
      `, [maDoiNha], { transaction });
      
      if (homeTeamResult.recordset.length === 0) {
        console.log('Home team not found:', maDoiNha);
        await db.rollbackTransaction(transaction);
        return res.status(404).json({ message: 'Home team not found' });
      }
    }
    
    if (maDoiKhach) {
      const awayTeamResult = await db.query(`
        SELECT MaDoi FROM DoiBong WHERE MaDoi = @param0
      `, [maDoiKhach], { transaction });
      
      if (awayTeamResult.recordset.length === 0) {
        console.log('Away team not found:', maDoiKhach);
        await db.rollbackTransaction(transaction);
        return res.status(404).json({ message: 'Away team not found' });
      }
    }
    
    // Check if both teams are the same
    if (maDoiNha && maDoiKhach && maDoiNha === maDoiKhach) {
      console.log('Home and away teams cannot be the same:', maDoiNha);
      await db.rollbackTransaction(transaction);
      return res.status(400).json({ message: 'Home and away teams cannot be the same' });
    }
    
    // Handle match ID (maTran)
    let matchId = null;
    
    // If maTran is provided, check if it exists
    if (maTran) {
      const matchResult = await db.query(`
        SELECT MaTranDau FROM TranDau WHERE MaTranDau = @param0
      `, [maTran], { transaction });
      
      if (matchResult.recordset.length === 0) {
        console.log('Match ID not found, creating new match:', maTran);
        
        // If match doesn't exist but we have teams, create it with the provided ID
        if (maDoiNha && maDoiKhach) {
          try {
            await db.query(`
              INSERT INTO TranDau (MaTranDau, MaGiaiDau, MaDoiNha, MaDoiKhach, ThoiGian, DiaDiem, TrangThai, BanThangDoiNha, BanThangDoiKhach)
              VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8)
            `, [maTran, maGiaiDau, maDoiNha, maDoiKhach, ngayThiDau, 'Chưa cập nhật', trangThai || 'Chưa diễn ra', banThangDoiNha, banThangDoiKhach], { transaction });
            
            matchId = maTran;
            console.log('Match created with provided ID:', matchId);
          } catch (matchError) {
            console.error('Error creating match with provided ID:', matchError);
            await db.rollbackTransaction(transaction);
            return res.status(500).json({ 
              message: 'Error creating match with provided ID', 
              error: matchError.message 
            });
          }
        } else {
          // If we don't have team info, reject the request
          console.log('Cannot use match ID without team information');
          await db.rollbackTransaction(transaction);
          return res.status(400).json({ 
            message: 'Cannot use the provided Match ID. Either it does not exist, or both team information must be provided to create it.' 
          });
        }
      } else {
        // Match exists, use it and update scores if needed
        matchId = maTran;
        console.log('Using existing match ID:', matchId);
        
        // Update match data if we have both home and away teams
        if (maDoiNha && maDoiKhach) {
          try {
            await db.query(`
              UPDATE TranDau 
              SET MaGiaiDau = @param1, 
                  MaDoiNha = @param2, 
                  MaDoiKhach = @param3, 
                  ThoiGian = @param4,
                  TrangThai = @param5,
                  BanThangDoiNha = @param6,
                  BanThangDoiKhach = @param7
              WHERE MaTranDau = @param0
            `, [matchId, maGiaiDau, maDoiNha, maDoiKhach, ngayThiDau, trangThai || 'Chưa diễn ra', banThangDoiNha, banThangDoiKhach], { transaction });
            
            console.log('Match updated with new data');
          } catch (updateError) {
            console.error('Error updating match:', updateError);
            await db.rollbackTransaction(transaction);
            return res.status(500).json({ 
              message: 'Error updating match', 
              error: updateError.message 
            });
          }
        }
      }
    } 
    // If no match ID is provided but we have teams, create a new match
    else if (maDoiNha && maDoiKhach) {
      // Generate a match ID
      matchId = `MATCH${Date.now().toString().slice(-6)}`;
      
      try {
        // Insert match data with scores and status
        await db.query(`
          INSERT INTO TranDau (MaTranDau, MaGiaiDau, MaDoiNha, MaDoiKhach, ThoiGian, DiaDiem, TrangThai, BanThangDoiNha, BanThangDoiKhach)
          VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8)
        `, [matchId, maGiaiDau, maDoiNha, maDoiKhach, ngayThiDau, 'Chưa cập nhật', trangThai || 'Chưa diễn ra', banThangDoiNha, banThangDoiKhach], { transaction });
        
        console.log('Match created with auto-generated ID:', matchId);
      } catch (matchError) {
        console.error('Error creating match:', matchError);
        await db.rollbackTransaction(transaction);
        return res.status(500).json({ 
          message: 'Error creating match', 
          error: matchError.message 
        });
      }
    }
    
    // Insert schedule
    try {
      await db.query(`
        INSERT INTO LichThiDau (MaLich, MaGiaiDau, MaTran, NgayThiDau)
        VALUES (@param0, @param1, @param2, @param3)
      `, [maLich, maGiaiDau, matchId, ngayThiDau], { transaction });
      
      // Commit the transaction
      await db.commitTransaction(transaction);
      
      console.log('Schedule created successfully:', maLich);
      
      res.status(201).json({
        message: 'Schedule created successfully',
        data: { maLich, maGiaiDau, maTran: matchId, ngayThiDau, maDoiNha, maDoiKhach }
      });
    } catch (insertError) {
      console.error('Error inserting schedule:', insertError);
      await db.rollbackTransaction(transaction);
      
      // Check if it's a foreign key constraint error
      if (insertError.number === 547) {
        return res.status(400).json({
          message: 'Foreign key constraint error. The Match ID might not exist.',
          error: insertError.message
        });
      }
      
      return res.status(500).json({ 
        message: 'Error inserting schedule', 
        error: insertError.message 
      });
    }
  } catch (error) {
    console.error('Error creating schedule:', error);
    
    // Rollback the transaction in case of error
    if (transaction) {
      await db.rollbackTransaction(transaction);
    }
    
    res.status(500).json({ 
      message: 'Server error while creating schedule.', 
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
    const { maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach, banThangDoiNha, banThangDoiKhach, trangThai } = req.body;
    
    console.log('Schedule update request:', {
      id, maGiaiDau, maTran, ngayThiDau, maDoiNha, maDoiKhach, banThangDoiNha, banThangDoiKhach, trangThai
    });
    
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
      const matchId = maTran || existingMaTran;
      if (matchId && (maDoiNha || maDoiKhach || trangThai || banThangDoiNha !== undefined || banThangDoiKhach !== undefined)) {
        // First get the existing match data
        const matchData = await db.query(`
          SELECT * FROM TranDau WHERE MaTranDau = @param0
        `, [matchId], { transaction });
        
        if (matchData.recordset.length > 0) {
          const existingMatch = matchData.recordset[0];
          
          // Build update query with all fields that should be updated
          await db.query(`
            UPDATE TranDau 
            SET MaGiaiDau = @param1, 
                MaDoiNha = @param2, 
                MaDoiKhach = @param3,
                ThoiGian = @param4,
                TrangThai = @param5,
                BanThangDoiNha = @param6,
                BanThangDoiKhach = @param7
            WHERE MaTranDau = @param0
          `, [
            matchId, 
            maGiaiDau || existingMatch.MaGiaiDau,
            maDoiNha || existingMatch.MaDoiNha,
            maDoiKhach || existingMatch.MaDoiKhach,
            ngayThiDau || existingMatch.ThoiGian,
            trangThai || existingMatch.TrangThai,
            banThangDoiNha !== undefined ? banThangDoiNha : existingMatch.BanThangDoiNha,
            banThangDoiKhach !== undefined ? banThangDoiKhach : existingMatch.BanThangDoiKhach
          ], { transaction });
          
          console.log('Updated match data for:', matchId);
        }
      }
      
      // Update schedule
      await db.query(`
        UPDATE LichThiDau 
        SET MaGiaiDau = @param1, 
            MaTran = @param2, 
            NgayThiDau = @param3
        WHERE MaLich = @param0
      `, [id, maGiaiDau, matchId, ngayThiDau], { transaction });
      
      // Commit the transaction
      await db.commitTransaction(transaction);
      
      // Get the updated schedule with all details (including team names, scores)
      const updatedSchedule = await db.query(`
        SELECT l.MaLich, l.MaGiaiDau, g.TenGiai, l.MaTran, 
               t.MaDoiNha, d1.TenDoi as TenDoiNha, 
               t.MaDoiKhach, d2.TenDoi as TenDoiKhach,
               FORMAT(l.NgayThiDau, 'yyyy-MM-dd') as NgayThiDau,
               t.BanThangDoiNha, t.BanThangDoiKhach, t.TrangThai
        FROM LichThiDau l
        LEFT JOIN GiaiDau g ON l.MaGiaiDau = g.MaGiaiDau
        LEFT JOIN TranDau t ON l.MaTran = t.MaTranDau
        LEFT JOIN DoiBong d1 ON t.MaDoiNha = d1.MaDoi
        LEFT JOIN DoiBong d2 ON t.MaDoiKhach = d2.MaDoi
        WHERE l.MaLich = @param0
      `, [id]);
      
      const completeData = updatedSchedule.recordset[0] || { 
        maLich: id, 
        maGiaiDau, 
        maTran: matchId, 
        ngayThiDau, 
        maDoiNha, 
        maDoiKhach, 
        banThangDoiNha, 
        banThangDoiKhach, 
        trangThai 
      };
      
      console.log('Sending updated schedule data:', completeData);
      
      res.status(200).json({ 
        message: 'Schedule updated successfully.',
        data: completeData
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