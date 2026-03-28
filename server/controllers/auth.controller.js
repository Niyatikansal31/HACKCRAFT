import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.model.js';
import Doctor from '../models/Doctor.model.js';
import Chemist from '../models/Chemist.model.js';
import OTP from '../models/OTP.model.js';

const roleModelMap = {
  patient: Patient,
  doctor: Doctor,
  chemist: Chemist,
};

function getModel(role) {
  const model = roleModelMap[role];

  if (!model) {
    const error = new Error('Invalid role');
    error.status = 400;
    throw error;
  }

  return model;
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'super-secret-change-me', { expiresIn: '24h' });
}

function sanitizeUser(user) {
  const object = user.toObject();
  delete object.passwordHash;
  return object;
}

export async function register(req, res, next) {
  try {
    const { role, password, ...rest } = req.body;
    const Model = getModel(role);
    const passwordHash = await bcrypt.hash(password, 10);

    const payload =
      role === 'patient'
        ? { ...rest, passwordHash, role }
        : role === 'doctor'
          ? { ...rest, passwordHash, role }
          : {
              ...rest,
              shopName: rest.shopName || rest.name,
              licenseNumber: rest.licenseNumber || rest.drugLicenseNumber,
              passwordHash,
              role,
            };

    const user = await Model.create(payload);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: user._id,
      role,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = 'An account with this unique field already exists';
    }
    next(error);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { phone, role } = req.body;
    getModel(role);

    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({ phone, otp, expiresAt, role });
    console.log(`OTP for ${phone} (${role}): ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully', otp });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { phone, otp, role } = req.body;
    const Model = getModel(role);

    const otpRecord = await OTP.findOne({ phone, role, otp, isUsed: false }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await Model.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    const token = signToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const Model = getModel(role);
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}
