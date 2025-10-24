import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'station_manager', 'operator'], 
    default: 'operator' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  profileImage: { type: String },
  // Yönettiği duraklar
  managedStations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station' 
  }]
}, { timestamps: true });

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifre karşılaştırma
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//Şifre gizleme
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);