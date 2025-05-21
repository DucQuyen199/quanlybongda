const GiaiDauModel = require('../models/giaiDauModel');

class GiaiDauController {
  static async getAllGiaiDau(req, res) {
    try {
      const giaiDaus = await GiaiDauModel.getAll();
      return res.status(200).json({
        success: true,
        data: giaiDaus
      });
    } catch (error) {
      console.error('Error in getAllGiaiDau:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async getGiaiDauById(req, res) {
    try {
      const { id } = req.params;
      const giaiDau = await GiaiDauModel.getById(id);
      
      if (!giaiDau) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giải đấu'
        });
      }

      return res.status(200).json({
        success: true,
        data: giaiDau
      });
    } catch (error) {
      console.error('Error in getGiaiDauById:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async createGiaiDau(req, res) {
    try {
      const { maGiaiDau, tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem } = req.body;
      
      // Simple validation
      if (!maGiaiDau || !tenGiai || !thoiGianBatDau || !thoiGianKetThuc || !diaDiem) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin giải đấu'
        });
      }

      const result = await GiaiDauModel.create({
        maGiaiDau,
        tenGiai,
        thoiGianBatDau,
        thoiGianKetThuc,
        diaDiem
      });

      return res.status(201).json({
        success: true,
        message: 'Tạo giải đấu thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in createGiaiDau:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async updateGiaiDau(req, res) {
    try {
      const { id } = req.params;
      const { tenGiai, thoiGianBatDau, thoiGianKetThuc, diaDiem } = req.body;
      
      // Simple validation
      if (!tenGiai || !thoiGianBatDau || !thoiGianKetThuc || !diaDiem) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin giải đấu'
        });
      }
      
      // Check if giaiDau exists
      const giaiDau = await GiaiDauModel.getById(id);
      if (!giaiDau) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giải đấu'
        });
      }

      const result = await GiaiDauModel.update(id, {
        tenGiai,
        thoiGianBatDau,
        thoiGianKetThuc,
        diaDiem
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật giải đấu thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in updateGiaiDau:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }

  static async deleteGiaiDau(req, res) {
    try {
      const { id } = req.params;
      
      // Check if giaiDau exists
      const giaiDau = await GiaiDauModel.getById(id);
      if (!giaiDau) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giải đấu'
        });
      }

      const result = await GiaiDauModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Xóa giải đấu thành công',
        rowsAffected: result.rowsAffected
      });
    } catch (error) {
      console.error('Error in deleteGiaiDau:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
}

module.exports = GiaiDauController; 