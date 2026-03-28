import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  city: String,
  address: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  preferredDoctorLanguage: String,
  appLanguage: String,
  referrerCode: String,
  reasonForJoining: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'patient' },
}, { timestamps: { createdAt: true, updatedAt: true } });

export default mongoose.model('Patient', patientSchema);
