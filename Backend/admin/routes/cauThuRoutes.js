const express = require('express');
const router = express.Router();
const cauThuController = require('../controllers/cauThuController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Player routes
router.get('/', cauThuController.getAllPlayers);
router.get('/:id', cauThuController.getPlayerById);
router.post('/', cauThuController.createPlayer);
router.put('/:id', cauThuController.updatePlayer);
router.delete('/:id', cauThuController.deletePlayer);

module.exports = router; 