import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthService {
  // JWT token oluştur
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Kullanıcı kaydı
  async register(userData) {
    try {
      // Email kontrolü
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Bu email zaten kullanılıyor');
      }

      // Kullanıcı oluştur
      const user = await User.create(userData);

      // Token oluştur
      const token = this.generateToken(user._id);

      return { user, token };
    } catch (error) {
      throw new Error(error.message || 'Kayıt başarısız');
    }
  }

  // Giriş yap
  async login(email, password) {
    try {
      // Kullanıcıyı bul (şifre ile birlikte)
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new Error('Email veya şifre hatalı');
      }

      // Şifre kontrolü
      const isPasswordCorrect = await user.comparePassword(password);
      
      if (!isPasswordCorrect) {
        throw new Error('Email veya şifre hatalı');
      }

      if (!user.isActive) {
        throw new Error('Hesabınız pasif durumda');
      }

      // Son giriş zamanını güncelle
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Token oluştur
      const token = this.generateToken(user._id);

      // Şifreyi kaldır
      user.password = undefined;

      return { user, token };
    } catch (error) {
      throw new Error(error.message || 'Giriş başarısız');
    }
  }

  // Profil bilgisi getir
  async getProfile(userId) {
    try {
      const user = await User.findById(userId).populate('managedStations');
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Profil güncelle
  async updateProfile(userId, updateData) {
    try {
      // Şifre güncellenmemelidir (ayrı endpoint)
      delete updateData.password;
      delete updateData.role; // Rol değiştirilemez

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Şifre değiştir
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Mevcut şifre kontrolü
      const isPasswordCorrect = await user.comparePassword(currentPassword);
      
      if (!isPasswordCorrect) {
        throw new Error('Mevcut şifre hatalı');
      }

      // Yeni şifreyi kaydet
      user.password = newPassword;
      await user.save();

      // Yeni token oluştur
      const token = this.generateToken(user._id);

      return { token };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();