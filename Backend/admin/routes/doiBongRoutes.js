const express = require('express');
const router = express.Router();
const doiBongController = require('../controllers/doiBongController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Team routes
router.get('/', doiBongController.getAllTeams);
router.get('/:id', doiBongController.getTeamById);
router.post('/', doiBongController.createTeam);
router.put('/:id', doiBongController.updateTeam);
router.delete('/:id', doiBongController.deleteTeam);

module.exports = router; 