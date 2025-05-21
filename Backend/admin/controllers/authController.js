const NguoiDungModel = require('../models/nguoiDungModel');
const jwt = require('jsonwebtoken');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tài khoản và mật khẩu'
        });
      }
      
      // Check if user exists
      const user = await NguoiDungModel.getByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản hoặc mật khẩu không chính xác'
        });
      }
      
      // Check password
      const isMatch = await NguoiDungModel.comparePassword(password, user.MatKhau);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản hoặc mật khẩu không chính xác'
        });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { id: user.MaND, role: user.VaiTro },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          id: user.MaND,
          name: user.HoTen,
          role: user.VaiTro
        },
        token
      });
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
  
  static async register(req, res) {
    try {
      const { maND, hoTen, tenDangNhap, matKhau, vaiTro } = req.body;
      
      // Validation
      if (!maND || !hoTen || !tenDangNhap || !matKhau || !vaiTro) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin người dùng'
        });
      }
      
      // Check if username already exists
      const existingUser = await NguoiDungModel.getByUsername(tenDangNhap);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }
      
      // Create new user
      const result = await NguoiDungModel.create({
        maND,
        hoTen,
        tenDangNhap,
        matKhau,
        vaiTro
      });
      
      return res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
  
  static async getCurrentUser(req, res) {
    try {
      const user = await NguoiDungModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user.MaND,
          name: user.HoTen,
          role: user.VaiTro
        }
      });
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
}

module.exports = AuthController; 