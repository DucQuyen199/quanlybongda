const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    
    if (!fullName || !username || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin đăng ký' 
      });
    }
    
    // Check if username already exists
    const existingUser = await UserModel.findByUsername(username);
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Tên đăng nhập đã tồn tại' 
      });
    }
    
    // Create new user
    const user = await UserModel.create({
      fullName,
      username,
      password
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.maND }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user.maND,
        name: user.hoTen,
        username: user.tenDangNhap,
        role: user.vaiTro
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
      });
    }
    
    // Find user by username
    const user = await UserModel.findByUsername(username);
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ' 
      });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.MATKHAU);
    
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.MAND }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.MAND,
        name: user.HOTEN,
        username: user.TENDANGNHAP,
        role: user.VAITRO
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      user: {
        id: user.MAND,
        name: user.HOTEN,
        username: user.TENDANGNHAP,
        role: user.VAITRO
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, currentPassword, newPassword } = req.body;
    const userId = req.user.MAND;
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Vui lòng nhập mật khẩu hiện tại' 
        });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, req.user.MATKHAU);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      }
    }
    
    const updatedUser = await UserModel.updateProfile(userId, {
      fullName,
      password: newPassword
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser.MAND,
        name: updatedUser.HOTEN,
        username: updatedUser.TENDANGNHAP,
        role: updatedUser.VAITRO
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 