const tripSchema = new mongoose.Schema({
  // Referanslar
  station: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station',
    required: true
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
  estimatedFare: { type: Number }, // TL
  actualFare: { type: Number }, // Gerçekleşen ücret
  
  // Zaman bilgileri
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  
  // Reddeden şoförler (havuz sistemi için)
  rejectedDrivers: [{
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    rejectedAt: { type: Date }
  }],
  
  // İptal bilgileri
  cancellationReason: { type: String },
  cancelledBy: { 
    type: String, 
    enum: ['station', 'driver', 'customer'] 
  },
  
  // Notlar
  notes: { type: String },
  
  // Ödeme durumu
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// Index'ler
tripSchema.index({ station: 1, status: 1, createdAt: -1 });
tripSchema.index({ driver: 1, status: 1 });

tripSchema.index({ "pickup.location": "2dsphere" });
tripSchema.index({ "dropoff.location": "2dsphere" });


export const Trip = mongoose.model('Trip', tripSchema);