const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/database'); // Use Oracle DB config

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize().catch(console.error);

// Import routes
const authRoutes = require('./routes/authRoutes');
const giaiDauRoutes = require('./routes/giaiDauRoutes');
const cauThuRoutes = require('./routes/cauThuRoutes');
const tranDauRoutes = require('./routes/tranDauRoutes');
const doiBongRoutes = require('./routes/doiBongRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/giaidau', giaiDauRoutes);
app.use('/api/cauthu', cauThuRoutes);
app.use('/api/trandau', tranDauRoutes);
app.use('/api/doibong', doiBongRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Football Management User API');
});

// Start server with error handling
app.listen(PORT, () => {
  console.log(`User server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free this port or set a different PORT environment variable.`);
    process.exit(1);
  } else {
    console.error(err);
  }
});
