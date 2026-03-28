import { Router } from 'express';
import {
  deliverNotification,
  handleUssd,
  sendEmergencySms,
  sendEventSms,
} from '../controllers/communication.controller.js';

const router = Router();

router.post('/emergency-sms', sendEmergencySms);
router.post('/event-sms', sendEventSms);
router.post('/notify', deliverNotification);
router.post('/ussd', handleUssd);

export default router;
