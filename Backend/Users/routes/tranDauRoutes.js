const express = require('express');
const router = express.Router();
const TranDauController = require('../controllers/tranDauController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all matches
router.get('/', TranDauController.getAllTranDau);

// Get match by ID
router.get('/:id', TranDauController.getTranDauById);

module.exports = router; 