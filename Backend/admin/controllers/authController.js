const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * User authentication
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Find the user in database
    const result = await db.query(`
      SELECT MaND, HoTen, TenDangNhap, MatKhau, VaiTro 
      FROM NguoiDung 
      WHERE TenDangNhap = @param0
    `, [username]);

    const user = result.recordset[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if user is ADMIN
    if (user.VaiTro !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Only admin users can login.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.MatKhau);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.MaND,
        username: user.TenDangNhap,
        name: user.HoTen,
        vaiTro: user.VaiTro
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.MaND,
        name: user.HoTen,
        username: user.TenDangNhap,
        role: user.VaiTro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

/**
 * Get current user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT MaND, HoTen, TenDangNhap, VaiTro 
      FROM NguoiDung 
      WHERE MaND = @param0
    `, [userId]);

    const user = result.recordset[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user.MaND,
      name: user.HoTen,
      username: user.TenDangNhap,
      role: user.VaiTro
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while retrieving profile.' });
  }
}; 