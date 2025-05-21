const sql = require('mssql');
require('dotenv').config({ path: '../.env' });

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456aA@$',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'bongda',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Test data
const testData = {
  // Admin user - created in create-admin.js, so we don't recreate
  tournaments: [
    {
      id: 'GIAI001',
      name: 'Premier League 2024',
      startDate: '2024-08-01',
      endDate: '2025-05-30',
      location: 'England'
    },
    {
      id: 'GIAI002',
      name: 'La Liga 2024',
      startDate: '2024-08-15',
      endDate: '2025-05-25',
      location: 'Spain'
    }
  ],
  teams: [
    {
      id: 'TEAM001',
      name: 'Manchester United',
      foundationDate: '1878-01-01',
      players: 25,
      logo: 'https://example.com/man_utd.png',
      homeStadium: 'Old Trafford'
    },
    {
      id: 'TEAM002',
      name: 'Barcelona',
      foundationDate: '1899-11-29',
      players: 25,
      logo: 'https://example.com/barcelona.png',
      homeStadium: 'Camp Nou'
    },
    {
      id: 'TEAM003',
      name: 'Real Madrid',
      foundationDate: '1902-03-06',
      players: 25,
      logo: 'https://example.com/real_madrid.png',
      homeStadium: 'Santiago Bernabéu'
    },
    {
      id: 'TEAM004',
      name: 'Arsenal',
      foundationDate: '1886-10-01',
      players: 25,
      logo: 'https://example.com/arsenal.png',
      homeStadium: 'Emirates Stadium'
    }
  ]
};

async function createTestData() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    
    // Create tournaments
    for (const tournament of testData.tournaments) {
      try {
        // Check if tournament exists
        const checkResult = await pool.request()
          .input('id', sql.VarChar, tournament.id)
          .query('SELECT MaGiaiDau FROM GiaiDau WHERE MaGiaiDau = @id');
        
        if (checkResult.recordset.length === 0) {
          await pool.request()
            .input('id', sql.VarChar, tournament.id)
            .input('name', sql.NVarChar, tournament.name)
            .input('startDate', sql.DateTime, tournament.startDate)
            .input('endDate', sql.DateTime, tournament.endDate)
            .input('location', sql.NVarChar, tournament.location)
            .query(`
              INSERT INTO GiaiDau (MaGiaiDau, TenGiai, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem)
              VALUES (@id, @name, @startDate, @endDate, @location)
            `);
          console.log(`Created tournament: ${tournament.name}`);
        } else {
          console.log(`Tournament ${tournament.name} already exists`);
        }
      } catch (error) {
        console.error(`Error creating tournament ${tournament.name}:`, error);
      }
    }
    
    // Create teams
    for (const team of testData.teams) {
      try {
        // Check if team exists
        const checkResult = await pool.request()
          .input('id', sql.VarChar, team.id)
          .query('SELECT MaDoi FROM DoiBong WHERE MaDoi = @id');
        
        if (checkResult.recordset.length === 0) {
          await pool.request()
            .input('id', sql.VarChar, team.id)
            .input('name', sql.NVarChar, team.name)
            .input('foundationDate', sql.Date, team.foundationDate)
            .input('players', sql.Int, team.players)
            .input('logo', sql.NVarChar, team.logo)
            .input('homeStadium', sql.NVarChar, team.homeStadium)
            .query(`
              INSERT INTO DoiBong (MaDoi, TenDoi, NgayThanhLap, SoLuongCauThu, Logo, SanNha)
              VALUES (@id, @name, @foundationDate, @players, @logo, @homeStadium)
            `);
          console.log(`Created team: ${team.name}`);
        } else {
          console.log(`Team ${team.name} already exists`);
        }
      } catch (error) {
        console.error(`Error creating team ${team.name}:`, error);
      }
    }
    
    // Add teams to tournaments
    for (const tournament of testData.tournaments) {
      for (const team of testData.teams) {
        try {
          // Check if team is already in tournament
          const checkResult = await pool.request()
            .input('tournamentId', sql.VarChar, tournament.id)
            .input('teamId', sql.VarChar, team.id)
            .query('SELECT * FROM GiaiDau_DoiBong WHERE MaGiaiDau = @tournamentId AND MaDoi = @teamId');
          
          if (checkResult.recordset.length === 0) {
            await pool.request()
              .input('tournamentId', sql.VarChar, tournament.id)
              .input('teamId', sql.VarChar, team.id)
              .query(`
                INSERT INTO GiaiDau_DoiBong (MaGiaiDau, MaDoi, DiemSo, BanThang, BanThua)
                VALUES (@tournamentId, @teamId, 0, 0, 0)
              `);
            console.log(`Added ${team.name} to ${tournament.name}`);
          } else {
            console.log(`${team.name} is already in ${tournament.name}`);
          }
        } catch (error) {
          console.error(`Error adding ${team.name} to ${tournament.name}:`, error);
        }
      }
    }
    
    console.log('Test data creation completed successfully');
    await pool.close();
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData(); 