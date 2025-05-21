const express = require('express');
const router = express.Router();
const DoiBongController = require('../controllers/doiBongController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all teams
router.get('/', DoiBongController.getAllDoiBong);

// Get team by ID
router.get('/:id', DoiBongController.getDoiBongById);

module.exports = router; 