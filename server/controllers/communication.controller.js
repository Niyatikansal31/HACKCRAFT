import { sendSms } from '../services/sms.service.js';

const criticalTypes = new Set(['emergency', 'appointment_1h', 'prescription_ready']);

function emergencyMessage(patientName) {
  return `EMERGENCY: ${patientName || 'Patient'} needs urgent help. Contact immediately.`;
}

export async function sendEmergencySms(req, res, next) {
  try {
    const { patientName, doctorPhone, patientPhone } = req.body;
    const result = await sendSms({
      to: [doctorPhone, patientPhone].filter(Boolean),
      message: emergencyMessage(patientName),
    });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
}

export async function sendEventSms(req, res, next) {
  try {
    const { to, message } = req.body;
    const result = await sendSms({ to, message });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
}

export async function deliverNotification(req, res, next) {
  try {
    const { type, message, to } = req.body;
    let smsResult = null;

    if (criticalTypes.has(String(type || '').toLowerCase()) && to) {
      smsResult = await sendSms({ to, message: message || 'Critical health alert from AID AI.' });
    }

    res.json({ success: true, delivered: true, smsResult });
  } catch (error) {
    next(error);
  }
}

export async function handleUssd(req, res, next) {
  try {
    const { text = '', msisdn = '' } = req.body;
    const input = String(text || '').trim();

    let response = 'CON AID AI Menu\n1. Upcoming Appointment\n2. Emergency Alert\n3. Doctor Contact';

    if (input === '1') {
      response = 'END Your next appointment: Today 04:30 PM with Dr. Ananya Rao.';
    } else if (input === '2') {
      await sendSms({
        to: process.env.USSD_EMERGENCY_DOCTOR_PHONE || '',
        message: `USSD EMERGENCY ALERT: Patient ${msisdn || 'unknown'} requested urgent help.`,
      });
      response = 'END Emergency alert sent to doctor.';
    } else if (input === '3') {
      response = `END Doctor contact: ${process.env.USSD_DOCTOR_PHONE || '9876500001'}`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  } catch (error) {
    next(error);
  }
}
