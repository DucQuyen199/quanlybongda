const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

// Get current user
router.get('/me', authenticate, AuthController.getCurrentUser);

// Update profile
router.put('/profile', authenticate, AuthController.updateProfile);

module.exports = router; 