const express = require('express');
const router = express.Router();
const GiaiDauController = require('../controllers/giaiDauController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all tournaments
router.get('/', GiaiDauController.getAllGiaiDau);

// Get tournament by ID
router.get('/:id', GiaiDauController.getGiaiDauById);

module.exports = router; 