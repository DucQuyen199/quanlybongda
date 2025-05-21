const express = require('express');
const router = express.Router();
const lichThiDauController = require('../controllers/lichThiDauController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Get all schedules with pagination
router.get('/', lichThiDauController.getAllLichThiDau);

// Get schedule by ID
router.get('/:id', lichThiDauController.getLichThiDauById);

// Create new schedule
router.post('/', lichThiDauController.createLichThiDau);

// Update schedule
router.put('/:id', lichThiDauController.updateLichThiDau);

// Delete schedule
router.delete('/:id', lichThiDauController.deleteLichThiDau);

module.exports = router; 