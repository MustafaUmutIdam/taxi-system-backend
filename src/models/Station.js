import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // Durak yöneticisi
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  // Durağa bağlı şoförler
  drivers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver' 
  }],
  isActive: { type: Boolean, default: true },
  // Durak ayarları
  settings: {
    baseRate: { type: Number, default: 50 }, // Açılış ücreti (TL)
    perKmRate: { type: Number, default: 15 }, // Km başı ücret (TL)
    nightSurcharge: { type: Number, default: 1.5 }, // Gece zammı (çarpan)
    nightStartHour: { type: Number, default: 0 }, // 00:00
    nightEndHour: { type: Number, default: 6 }, // 06:00
    minFare: { type: Number, default: 50 } // Minimum ücret
  },
  // İstatistikler
  stats: {
    totalTrips: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    activeDrivers: { type: Number, default: 0 }
  }

}, { timestamps: true });

stationSchema.index({ location: '2dsphere' });

const Station = mongoose.model('Station', stationSchema);
export default Station;