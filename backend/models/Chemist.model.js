import mongoose from 'mongoose';

const chemistSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  city: String,
  address: String,
  licenseNumber: { type: String, required: true, unique: true },
  licenseValidityDate: Date,
  servicesOffered: [String],
  operatingHours: {
    open: String,
    close: String,
    days: [String],
  },
  profilePhoto: String,
  deliveryAvailable: { type: Boolean, default: true },
  deliveryRadiusKm: { type: Number, default: 5 },
  deliveryPincodes: [String],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.5946, 12.9716] },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'chemist' },
}, { timestamps: { createdAt: true, updatedAt: true } });

chemistSchema.index({ location: '2dsphere' });

export default mongoose.model('Chemist', chemistSchema);
