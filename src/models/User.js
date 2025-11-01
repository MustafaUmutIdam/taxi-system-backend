import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Ad soyad gereklidir'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email gereklidir'],
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
  },
  password: { 
    type: String, 
    required: [true, 'Şifre gereklidir'],
    minlength: 6,
    select: false // Default olarak şifre dönmesin
  },
  phone: { 
    type: String, 
    required: [true, 'Telefon gereklidir']
  },
  role: { 
    type: String, 
    enum: ['admin', 'station_manager', 'operator'], 
    default: 'station_manager' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  profileImage: { 
    type: String 
  },
  // Yönettiği duraklar
  managedStations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station' 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Şifre hashleme (kayıt veya şifre değişikliğinde)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON'a çevrilirken şifreyi gizle
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);