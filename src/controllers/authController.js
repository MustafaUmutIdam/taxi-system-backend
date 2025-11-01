import authService from '../services/authService.js';
import { validationResult } from 'express-validator';

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { user, token } = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Kayıt başarılı',
        data: { user, token }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email ve şifre gereklidir'
        });
      }

      const { user, token } = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        data: { user, token }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/auth/me
  async getMe(req, res) {
    try {
      const user = await authService.getProfile(req.user._id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/auth/profile
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);

      res.status(200).json({
        success: true,
        message: 'Profil güncellendi',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut ve yeni şifre gereklidir'
        });
      }

      const { token } = await authService.changePassword(
        req.user._id,
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
}

export default new AuthController();
