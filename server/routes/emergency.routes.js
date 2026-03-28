import { Router } from 'express';
import { getNearbyServices, getOnlineDoctors } from '../controllers/emergency.controller.js';

const router = Router();

router.get('/online-doctors', getOnlineDoctors);
router.get('/nearby-services', getNearbyServices);

export default router;
