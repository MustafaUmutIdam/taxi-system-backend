import driverAuthService from '../services/driverAuthService.js';
import { validationResult } from 'express-validator';

class DriverAuthController {
  // POST /api/driver-auth/register
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { driver, token } = await driverAuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Kayıt başarılı',
        data: { driver, token }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/driver-auth/login
  async login(req, res) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Telefon ve şifre gereklidir'
        });
      }

      const { driver, token } = await driverAuthService.login(phone, password);

      res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        data: { driver, token }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/driver-auth/me
  async getMe(req, res) {
    try {
      const driver = await driverAuthService.getProfile(req.driver._id);

      res.status(200).json({
        success: true,
        data: driver
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/driver-auth/profile
  async updateProfile(req, res) {
    try {
      const driver = await driverAuthService.updateProfile(req.driver._id, req.body);

      res.status(200).json({
        success: true,
        message: 'Profil güncellendi',
        data: driver
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateStatus(req, res) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status gereklidir"
      });
    }

    const driver = await driverAuthService.updateStatus(req.driver._id, status);

    res.status(200).json({
      success: true,
      message: "Durum güncellendi",
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

  // PUT /api/driver-auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut ve yeni şifre gereklidir'
        });
      }

      const { token } = await driverAuthService.changePassword(
        req.driver._id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Şifre değiştirildi',
        data: { token }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/driver-auth/trips
  async getDriverTrips(req, res) {
    try {
      const { status, limit = 10, offset = 0 } = req.query;
      
      const trips = await driverAuthService.getDriverTrips(
        req.driver._id,
        { status, limit: parseInt(limit), offset: parseInt(offset) }
      );

      res.status(200).json({
        success: true,
        count: trips.length,
        data: trips
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new DriverAuthController();