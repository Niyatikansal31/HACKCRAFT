import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  day: String,
  startTime: String,
  endTime: String,
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  city: String,
  address: String,
  medicalRegNumber: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  qualifications: [String],
  experience: Number,
  consultationFee: Number,
  availableLanguages: [String],
  clinicName: String,
  clinicAddress: String,
  availabilitySlots: [availabilitySlotSchema],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: true },
  rating: {
    average: { type: Number, default: 4.8 },
    totalReviews: { type: Number, default: 0 },
  },
  role: { type: String, default: 'doctor' },
}, { timestamps: { createdAt: true, updatedAt: true } });

export default mongoose.model('Doctor', doctorSchema);
