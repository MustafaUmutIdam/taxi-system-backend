import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const driverSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true },
  password: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  vehiclePlate: { type: String, required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  status: { type: String, enum: ["active", "busy", "offline", "break"], default: "offline" },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date }
  },
  profileImage: { type: String },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  totalTrips: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastOnline: { type: Date },
  fcmToken: { type: String }
}, { timestamps: true });

// 🔒 Şifre hashleme
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 📍 Varsayılan konum ekleme (örnek: Ankara)
driverSchema.pre("save", function (next) {
  if (!this.currentLocation || !this.currentLocation.lat || !this.currentLocation.lng) {
    this.currentLocation = {
      lat: 39.9208, // Ankara merkez
      lng: 32.8541,
      lastUpdated: new Date()
    };
  }
  next();
});

// 🔑 Şifre karşılaştırma metodu
driverSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

driverSchema.index({ "currentLocation": "2dsphere" });

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
