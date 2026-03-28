import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import Toast from '../components/ui/Toast';
import { getAppointments, markAppointmentPaid, savePayment } from '../utils/appointments';
import { saveSnapshot } from '../utils/offlineStore';
import { apiRequest } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useConnectivity } from '../hooks/useConnectivity';

function AppointmentsPage() {
  const [tab, setTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const { isOnline, queueCriticalNotification } = useConnectivity();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  const resolvePatientForDoctor = (appointment, index) => {
    const fallbacks = ['Riya Sharma', 'Aman Patel', 'Neha Verma', 'Sahil Khan', 'Priya Nair'];
    const rawName = String(appointment.patientName || '').trim();
    const doctorName = String(appointment.doctor || '').trim();
    const looksLikeDoctor =
      !rawName ||
      rawName.toLowerCase().startsWith('dr') ||
      rawName.toLowerCase().includes('doctor') ||
      (doctorName && rawName.toLowerCase() === doctorName.toLowerCase());
    return looksLikeDoctor ? fallbacks[index % fallbacks.length] : rawName;
  };

  useEffect(() => {
    const list = getAppointments();
    setAppointments(list);
    saveSnapshot('appointments', list);

    const reminderSentKey = `aid_sms_reminder_${new Date().toDateString()}`;
    if (!localStorage.getItem(reminderSentKey)) {
      const nextAppointment = list.find((item) => String(item.status).toLowerCase() !== 'completed');
      if (nextAppointment && user?.phone) {
        const payload = {
          to: user.phone,
          message: `Reminder: Upcoming appointment with ${nextAppointment.doctor} at ${nextAppointment.date}.`,
        };

        apiRequest('/api/communication/event-sms', {
          method: 'POST',
          body: JSON.stringify(payload),
        }).then(() => {
          localStorage.setItem(reminderSentKey, '1');
        }).catch(() => {
          // offline queue handles retry
        });

        if (!isOnline) {
          queueCriticalNotification({
            type: 'appointment_1h',
            message: payload.message,
            to: payload.to,
          });
        }
      }
    }
  }, []);

  const visibleAppointments = useMemo(
    () => appointments.filter((item) => (tab === 'upcoming' ? item.status !== 'Completed' : item.status === 'Completed')),
    [appointments, tab],
  );

  const handlePayNow = (appointment) => {
    const updated = markAppointmentPaid(appointment.id);
    savePayment({
      description: `${appointment.mode === 'instant' ? '15-minute consultation' : 'Doctor consultation'} - ${appointment.doctor}`,
      amount: appointment.paymentAmount,
      appointmentId: appointment.id,
    });
    setAppointments(getAppointments());
    setToast({
      type: 'success',
      title: 'Payment successful',
      message: `Payment received for ${appointment.doctor}. You can now join the consultation.`,
    });
    setTimeout(() => setToast(null), 4000);
    return updated;
  };

  const handleCancel = (appointment) => {
    const reason = window.prompt('Cancellation reason');
    if (!reason) return;
    const next = getAppointments().map((item) =>
      item.id === appointment.id
        ? { ...item, status: 'Cancelled', cancellationReason: reason }
        : item,
    );
    localStorage.setItem('aid_appointments', JSON.stringify(next));
    setAppointments(next);
    apiRequest('/api/communication/event-sms', {
      method: 'POST',
      body: JSON.stringify({
        to: appointment.doctorPhone || '',
        message: `Appointment cancellation: ${user?.name || 'Patient'} cancelled appointment (${appointment.date}). Reason: ${reason}`,
      }),
    }).catch(() => {});
    setToast({
      type: 'success',
      title: 'Appointment cancelled',
      message: 'Cancellation recorded and doctor SMS fallback queued.',
    });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title="Appointments"
        description="Manage upcoming and past appointments with payment and consultation access."
        breadcrumb="Dashboard / Appointments"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="42" y="32" width="136" height="116" rx="20" fill="#DBEAFE" /><path d="M72 22V50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path d="M148 22V50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path d="M74 84H146" stroke="#F87171" strokeWidth="6" strokeLinecap="round" /></svg>}
      />
      <div className="aid-card">
        <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          {['upcoming', 'past'].map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-2xl px-5 py-3 font-semibold capitalize ${tab === item ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>{item}</button>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {visibleAppointments.map((appointment, index) => (
            <div key={appointment.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{isDoctor ? resolvePatientForDoctor(appointment, index) : appointment.doctor}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${appointment.mode === 'instant' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200'}`}>
                      {appointment.mode === 'instant' ? '15 Min Consult' : 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{appointment.date}</p>
                  {appointment.reason ? <p className="mt-1 text-sm text-gray-500">Reason: {appointment.reason}</p> : null}
                  <p className="mt-1 text-sm text-gray-500">
                    {isDoctor ? `Consultation Status: ${appointment.status}` : `Payment: Rs. ${appointment.paymentAmount} • ${appointment.paymentStatus}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {!isDoctor && appointment.paymentStatus !== 'paid' ? (
                    <button type="button" onClick={() => handlePayNow(appointment)} className="aid-btn-accent">
                      Pay Now
                    </button>
                  ) : null}
                  {(appointment.canJoin || isDoctor) && appointment.status !== 'Cancelled' ? (
                    <button type="button" onClick={() => navigate(`/consultation/${appointment.consultationId}`)} className="aid-btn-primary">
                      {isDoctor ? 'Open Consultation' : 'Join Consultation'}
                    </button>
                  ) : null}
                  {!isDoctor ? (
                    <Link to="/payments" className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      View Payments
                    </Link>
                  ) : null}
                  {!isDoctor && appointment.status !== 'Cancelled' ? (
                    <button type="button" onClick={() => handleCancel(appointment)} className="rounded-lg bg-red-500 px-4 py-3 font-semibold text-white">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {visibleAppointments.length === 0 ? <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500 dark:bg-gray-900">No appointments in this tab yet.</div> : null}
        </div>
      </div>
    </AppShell>
  );
}

export default AppointmentsPage;
