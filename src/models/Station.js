import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Station name is required'],
    trim: true
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true
  },
  phone: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9\s\-\+\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  location: {
    lat: { 
      type: Number,
      min: -90,
      max: 90
    },
    lng: { 
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
stationSchema.index({ name: 1 });
stationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model('Station', stationSchema);