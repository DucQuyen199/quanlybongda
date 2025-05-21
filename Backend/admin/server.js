const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize().catch(console.error);

// Import routes
const giaiDauRoutes = require('./routes/giaiDauRoutes');
const nguoiDungRoutes = require('./routes/nguoiDungRoutes');

// Use routes
app.use('/api/giaidau', giaiDauRoutes);
app.use('/api/nguoidung', nguoiDungRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Football Management API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
