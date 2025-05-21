const NguoiDungModel = require('../models/nguoiDungModel');

class NguoiDungController {
  static async getAllNguoiDung(req, res) {
    try {
      const users = await NguoiDungModel.getAll();
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error in getAllNguoiDung:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async getNguoiDungById(req, res) {
    try {
      const { id } = req.params;
      const user = await NguoiDungModel.getById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in getNguoiDungById:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async createNguoiDung(req, res) {
    try {
      const { maND, hoTen, tenDangNhap, matKhau, vaiTro } = req.body;
      
      // Simple validation
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
      console.error('Error in createNguoiDung:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async updateNguoiDung(req, res) {
    try {
      const { id } = req.params;
      const { hoTen, tenDangNhap, matKhau, vaiTro } = req.body;
      
      // Simple validation
      if (!hoTen || !tenDangNhap || !vaiTro) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin người dùng'
        });
      }
      
      // Check if user exists
      const user = await NguoiDungModel.getById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      // Check if new username is taken by another user
      if (tenDangNhap !== user.TenDangNhap) {
        const existingUser = await NguoiDungModel.getByUsername(tenDangNhap);
        if (existingUser && existingUser.MaND !== id) {
          return res.status(400).json({
            success: false,
            message: 'Tên đăng nhập đã tồn tại'
          });
        }
      }

      const result = await NguoiDungModel.update(id, {
        hoTen,
        tenDangNhap,
        matKhau,
        vaiTro
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in updateNguoiDung:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async deleteNguoiDung(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await NguoiDungModel.getById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      const result = await NguoiDungModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in deleteNguoiDung:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
}

module.exports = NguoiDungController; 