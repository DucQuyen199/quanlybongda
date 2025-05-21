const express = require('express');
const router = express.Router();
const giaiDauController = require('../controllers/giaiDauController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Basic root route
router.get('/', giaiDauController.getAllGiaiDau);

// Advanced admin app routes (specific routes must come before generic ones)
router.get('/admin/paginated', giaiDauController.getPaginatedGiaiDau);
router.get('/admin/detail/:id', giaiDauController.getGiaiDauDetailForAdmin);

// Team management in tournaments (specific routes)
router.post('/team', giaiDauController.addTeamToTournament);

// Basic CRUD routes with path parameters (must be placed after the more specific routes)
router.get('/:id', giaiDauController.getGiaiDauById);
router.post('/', giaiDauController.createGiaiDau);
router.put('/:id', giaiDauController.updateGiaiDau);
router.delete('/:id', giaiDauController.deleteGiaiDau);
router.delete('/:maGiaiDau/team/:maDoi', giaiDauController.removeTeamFromTournament);

module.exports = router; 