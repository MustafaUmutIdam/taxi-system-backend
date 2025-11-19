import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';
import Station from '../models/Station.js';

class DriverAuthService {
  // JWT token oluştur
  generateToken(driverId) {
    return jwt.sign(
      { id: driverId, type: 'driver' }, // type ekledik
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Driver kaydı
  async register(driverData) {
    try {
      // Telefon kontrolü
      const existingDriver = await Driver.findOne({ phone: driverData.phone });
      if (existingDriver) {
        throw new Error('Bu telefon numarası zaten kullanılıyor');
      }

      // Station kontrolü
      const station = await Station.findById(driverData.station);
      if (!station) {
        throw new Error('Geçersiz durak ID');
      }

      // Driver oluştur
      const driver = new Driver(driverData);
      await driver.save();

      // Station'a driver ekle
      station.drivers = station.drivers || [];
      station.drivers.push(driver._id);
      await station.save();

      // Token oluştur
      const token = this.generateToken(driver._id);

      // Şifreyi kaldır
      const driverObject = driver.toObject();
      delete driverObject.password;

      // Station bilgisini populate et
      const populatedDriver = await Driver.findById(driver._id).populate('station', 'name address location');

      return { driver: populatedDriver, token };
    } catch (error) {
      throw new Error(error.message || 'Kayıt başarısız');
    }
  }

  // Driver girişi
  async login(phone, password) {
    try {
      // Driver'ı bul (şifre ile birlikte)
      const driver = await Driver.findOne({ phone }).select('+password').populate('station', 'name address location');

      if (!driver) {
        throw new Error('Telefon numarası veya şifre hatalı');
      }

      // Şifre kontrolü
      const isPasswordCorrect = await driver.comparePassword(password);
      
      if (!isPasswordCorrect) {
        throw new Error('Telefon numarası veya şifre hatalı');
      }

      if (!driver.isActive) {
        throw new Error('Hesabınız pasif durumda');
      }

      // Son giriş zamanını güncelle
      driver.lastOnline = new Date();
      await driver.save({ validateBeforeSave: false });

      // Token oluştur
      const token = this.generateToken(driver._id);

      // Şifreyi kaldır
      const driverObject = driver.toObject();
      delete driverObject.password;

      return { driver: driverObject, token };
    } catch (error) {
      throw new Error(error.message || 'Giriş başarısız');
    }
  }

  // Driver profil bilgisi
  async getProfile(driverId) {
    try {
      const driver = await Driver.findById(driverId).populate('station', 'name address location');
      
      if (!driver) {
        throw new Error('Şoför bulunamadı');
      }

      return driver;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Driver profil güncelle
  async updateProfile(driverId, updateData) {
    try {
      // Şifre ve station güncellenmemeli
      delete updateData.password;
      delete updateData.station;

      const driver = await Driver.findByIdAndUpdate(
        driverId,
        updateData,
        { new: true, runValidators: true }
      ).populate('station', 'name address location');

      if (!driver) {
        throw new Error('Şoför bulunamadı');
      }

      return driver;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Şifre değiştir
  async changePassword(driverId, currentPassword, newPassword) {
    try {
      const driver = await Driver.findById(driverId).select('+password');

      if (!driver) {
        throw new Error('Şoför bulunamadı');
      }

      // Mevcut şifre kontrolü
      const isPasswordCorrect = await driver.comparePassword(currentPassword);
      
      if (!isPasswordCorrect) {
        throw new Error('Mevcut şifre hatalı');
      }

      // Yeni şifreyi kaydet
      driver.password = newPassword;
      await driver.save();

      // Yeni token oluştur
      const token = this.generateToken(driver._id);

      return { token };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new DriverAuthService();