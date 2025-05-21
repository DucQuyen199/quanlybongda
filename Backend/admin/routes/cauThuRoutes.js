const express = require('express');
const router = express.Router();
const cauThuController = require('../controllers/cauThuController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Get all players with pagination
router.get('/', cauThuController.getAllCauThu);

// Get player by ID
router.get('/:id', cauThuController.getCauThuById);

// Create new player
router.post('/', cauThuController.createCauThu);

// Update player
router.put('/:id', cauThuController.updateCauThu);

// Delete player
router.delete('/:id', cauThuController.deleteCauThu);

module.exports = router; 