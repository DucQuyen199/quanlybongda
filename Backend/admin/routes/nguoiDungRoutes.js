const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const NguoiDungController = require('../controllers/nguoiDungController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', authenticate, AuthController.getCurrentUser);

// User management routes
router.get('/', authenticate, authorize(['admin']), NguoiDungController.getAllNguoiDung);
router.get('/:id', authenticate, authorize(['admin']), NguoiDungController.getNguoiDungById);
router.post('/', authenticate, authorize(['admin']), NguoiDungController.createNguoiDung);
router.put('/:id', authenticate, authorize(['admin']), NguoiDungController.updateNguoiDung);
router.delete('/:id', authenticate, authorize(['admin']), NguoiDungController.deleteNguoiDung);

module.exports = router; 