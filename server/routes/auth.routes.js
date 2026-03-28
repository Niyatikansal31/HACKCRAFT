import { Router } from 'express';
import { login, register, sendOtp, verifyOtp } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

export default router;
