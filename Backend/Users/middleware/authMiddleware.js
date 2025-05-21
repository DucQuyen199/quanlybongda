const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực, vui lòng đăng nhập' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Optional middleware to check for admin rights
exports.isAdmin = (req, res, next) => {
  // Handle both uppercase (from Oracle) and proper case (from SQL Server)
  const userRole = req.user?.VaiTro || req.user?.VAITRO;
  
  if (req.user && userRole === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
}; 