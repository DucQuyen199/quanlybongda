const express = require('express');
const router = express.Router();
const CauThuController = require('../controllers/cauThuController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all players
router.get('/', CauThuController.getAllCauThu);

// Get player by ID
router.get('/:id', CauThuController.getCauThuById);

module.exports = router; 