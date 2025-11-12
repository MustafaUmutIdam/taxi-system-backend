import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  // Referanslar
  station: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station',
    required: false
  },
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver'
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // Yolculuk durumu
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Müşteri bilgileri
  customer: {
    name: { type: String },
    phone: { type: String, required: true }
  },
  
  // Adres bilgileri
  pickup: {
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  dropoff: {
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  
  // Mesafe ve ücret
  distance: { type: Number }, // km
  estimatedDuration: { type: Number }, // dakika
  estimatedFare: { type: Number }, // TL
  actualFare: { type: Number }, // Gerçekleşen ücret
  
  // Zaman bilgileri
  requestedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  acceptedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  
  // Driver eşleştirme (havuz sistemi)
  currentAttempt: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 10 },
  assignmentExpiry: { type: Date }, // 15 saniye sonrası
  
  // Reddeden şoförler
  rejectedDrivers: [{
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    rejectedAt: { type: Date, default: Date.now },
    reason: { type: String }
  }],
  
  // İptal bilgileri
  cancellationReason: { type: String },
  cancelledBy: { 
    type: String, 
    enum: ['station', 'driver', 'customer', 'system'] 
  },
  
  // Notlar
  notes: { type: String },
  
  // Ödeme durumu
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  
  // Fiyat detayları
  fareDetails: {
    baseRate: { type: Number },
    perKmRate: { type: Number },
    distance: { type: Number },
    isNightTime: { type: Boolean },
    nightSurcharge: { type: Number },
    total: { type: Number }
  }
}, { 
  timestamps: true 
});

// Index'ler
tripSchema.index({ station: 1, status: 1, createdAt: -1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ status: 1, assignmentExpiry: 1 });

export default mongoose.model('Trip', tripSchema);