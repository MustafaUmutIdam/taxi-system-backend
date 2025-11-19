import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';

// Driver token doğrulama middleware
export const protectDriver = async (req, res, next) => {
  try {
    let token;

    // Header'dan token al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Driver olup olmadığını kontrol et
    if (decoded.type !== 'driver') {
      return res.status(401).json({
        success: false,
        message: 'Şoför girişi gerekiyor'
      });
    }

    // Driver'ı bul
    const driver = await Driver.findById(decoded.id).select('-password').populate('station', 'name address location');

    if (!driver) {
      return res.status(401).json({
        success: false,
        message: 'Şoför bulunamadı'
      });
    }

    if (!driver.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız pasif durumda'
      });
    }

    // Driver'ı request'e ekle
    req.driver = driver;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};