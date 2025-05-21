const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize().catch(console.error);

// Import routes
const authRoutes = require('./routes/authRoutes');
const giaiDauRoutes = require('./routes/giaiDauRoutes');
const doiBongRoutes = require('./routes/doiBongRoutes');
const cauThuRoutes = require('./routes/cauThuRoutes');
const lichThiDauRoutes = require('./routes/lichThiDauRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/giaidau', giaiDauRoutes);
app.use('/api/doibong', doiBongRoutes);
app.use('/api/cauthu', cauThuRoutes);
app.use('/api/lichtd', lichThiDauRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Football Management API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
