const express = require('express');
const router = express.Router();
const doiBongController = require('../controllers/doiBongController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all teams with pagination and filtering
router.get('/', doiBongController.getAllDoiBong);

// Get team by ID
router.get('/:id', doiBongController.getDoiBongById);

// Create new team
router.post('/', doiBongController.createDoiBong);

// Update team
router.put('/:id', doiBongController.updateDoiBong);

// Delete team
router.delete('/:id', doiBongController.deleteDoiBong);

module.exports = router; 