const express = require('express');
const router = express.Router();
const giaiDauController = require('../controllers/giaiDauController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Tournament routes
router.get('/', giaiDauController.getAllGiaiDau);
router.get('/:id', giaiDauController.getGiaiDauById);
router.post('/', giaiDauController.createGiaiDau);
router.put('/:id', giaiDauController.updateGiaiDau);
router.delete('/:id', giaiDauController.deleteGiaiDau);

module.exports = router; 