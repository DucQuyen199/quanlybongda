const express = require('express');
const router = express.Router();
const GiaiDauController = require('../controllers/giaiDauController');

// Get all tournaments
router.get('/', GiaiDauController.getAllGiaiDau);

// Get tournament by ID
router.get('/:id', GiaiDauController.getGiaiDauById);

// Create new tournament
router.post('/', GiaiDauController.createGiaiDau);

// Update tournament
router.put('/:id', GiaiDauController.updateGiaiDau);

// Delete tournament
router.delete('/:id', GiaiDauController.deleteGiaiDau);

module.exports = router; 