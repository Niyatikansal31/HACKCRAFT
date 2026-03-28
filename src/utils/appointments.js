import { appointments as defaultAppointments } from './mockData';
import { saveSnapshot } from './offlineStore';

const STORAGE_KEY = 'aid_appointments';
const PAYMENTS_KEY = 'aid_payments';

function normalizeAppointments(items) {
  return items.map((appointment) => ({
    consultationId: appointment.consultationId || `consult-${appointment.id}`,
    paymentAmount: appointment.paymentAmount ?? 0,
    paymentStatus: appointment.paymentStatus || 'paid',
    mode: appointment.mode || 'scheduled',
    canJoin: appointment.canJoin ?? appointment.status === 'Confirmed',
    ...appointment,
  }));
}

export function getAppointments() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return normalizeAppointments(defaultAppointments);
  }

  try {
    return normalizeAppointments(JSON.parse(stored));
  } catch {
    return normalizeAppointments(defaultAppointments);
  }
}

export function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  saveSnapshot('appointments', appointments);
}

export function saveAppointment(appointment) {
  const current = getAppointments();
  const next = [
    {
      id: Date.now(),
      status: 'Confirmed',
      paymentStatus: 'pending',
      canJoin: false,
      consultationId: `consult-${Date.now()}`,
      paymentAmount: appointment.paymentAmount ?? 0,
      mode: appointment.mode || 'scheduled',
      ...appointment,
    },
    ...current,
  ];

  saveAppointments(next);
  return next[0];
}

export function markAppointmentPaid(appointmentId) {
  const next = getAppointments().map((appointment) =>
    appointment.id === appointmentId
      ? {
          ...appointment,
          paymentStatus: 'paid',
          canJoin: true,
        }
      : appointment,
  );

  saveAppointments(next);
  return next.find((appointment) => appointment.id === appointmentId);
}

export function getPayments() {
  const stored = localStorage.getItem(PAYMENTS_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function savePayment(payment) {
  const current = getPayments();
  const next = [
    {
      id: `pay-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Paid',
      ...payment,
    },
    ...current,
  ];

  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(next));
  saveSnapshot('payment_history', next);
  return next[0];
}
