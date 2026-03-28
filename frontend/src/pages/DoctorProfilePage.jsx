import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import Toast from '../components/ui/Toast';
import SupportNotice from '../components/ui/SupportNotice';
import FieldLabel from '../components/ui/FieldLabel';
import FormFieldCard from '../components/ui/FormFieldCard';
import VoiceInputButton from '../components/ui/VoiceInputButton';
import { useAuth } from '../hooks/useAuth';
import { saveAppointment } from '../utils/appointments';
import { mockDoctors } from '../utils/mockData';
import { apiRequest } from '../utils/api';

function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctor = mockDoctors.find((item) => item.id === id) || mockDoctors[0];
  const [selectedSlot, setSelectedSlot] = useState(doctor.availability[0] || '');
  const [bookingType, setBookingType] = useState('scheduled');
  const [form, setForm] = useState({ patientName: user?.name || '', reason: '' });
  const [toast, setToast] = useState(null);

  const icons = {
    name: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M5 20C6 16.5 9 15 12 15C15 15 18 16.5 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    reason: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M7 5H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 10H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 15H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  };

  const confirmBooking = () => {
    if (!form.patientName.trim() || !form.reason.trim() || !selectedSlot) {
      setToast({ type: 'error', title: 'Booking incomplete', message: 'Choose a slot and fill in both fields before confirming.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    saveAppointment({
      doctor: doctor.name,
      date: bookingType === 'instant' ? 'Within 15 minutes' : selectedSlot,
      patientName: form.patientName,
      reason: form.reason,
      paymentAmount: doctor.fee,
      doctorPhone: doctor.phone || '',
      mode: bookingType,
      status: bookingType === 'instant' ? 'Ready Now' : 'Confirmed',
      canJoin: false,
      paymentStatus: 'pending',
    });

    setToast({
      type: 'success',
      title: 'Appointment booked',
      message:
        bookingType === 'instant'
          ? `Your 15-minute consultation request with ${doctor.name} is created. Complete payment to unlock joining.`
          : `Your consultation with ${doctor.name} is confirmed for ${selectedSlot}. Complete payment next.`,
    });

    setTimeout(() => {
      setToast(null);
      navigate('/appointments');
    }, 1500);

    apiRequest('/api/communication/event-sms', {
      method: 'POST',
      body: JSON.stringify({
        to: [doctor.phone, user?.phone].filter(Boolean),
        message: `Appointment confirmed: ${form.patientName || 'Patient'} with ${doctor.name} at ${bookingType === 'instant' ? 'within 15 minutes' : selectedSlot}.`,
      }),
    }).catch(() => {
      // non-blocking fallback
    });
  };

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title={doctor.name}
        description={`${doctor.specialization} with ${doctor.experience} years of experience. Book available slots and consult with confidence.`}
        breadcrumb="Dashboard / Doctors / Profile"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><circle cx="110" cy="56" r="28" fill="#DBEAFE" /><circle cx="110" cy="56" r="24" stroke="currentColor" strokeWidth="3" /><path d="M64 146C72 110 148 110 156 146" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M104 54H116" stroke="#F87171" strokeWidth="4" strokeLinecap="round" /><path d="M110 48V60" stroke="#F87171" strokeWidth="4" strokeLinecap="round" /></svg>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <div className="space-y-6">
          <SupportNotice title="Doctor summary" text={`${doctor.name} is a ${doctor.specialization} from ${doctor.city}. They speak ${doctor.languages.join(', ')}.`} />

          <div className="aid-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold">Choose a time</h3>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                Consultation fee: ₹{doctor.fee}
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doctor.availability.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-2xl px-4 py-4 font-semibold transition ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="aid-card border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-200">Need help quickly?</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-200">Choose the 15-minute doctor consultation if you want faster guidance for a problem that should not wait long.</p>
            <button
              type="button"
              onClick={() => setBookingType('instant')}
              className={`mt-5 w-full rounded-2xl px-5 py-4 font-semibold ${bookingType === 'instant' ? 'bg-red-500 text-white' : 'bg-white text-red-600 dark:bg-gray-900 dark:text-red-200'}`}
            >
              Request consultation within 15 minutes
            </button>
          </div>
        </div>

        <div className="aid-card">
          <h3 className="text-xl font-bold">Finish booking</h3>
          <div className="mt-6 space-y-4">
            <SupportNotice title="Selected plan" text={bookingType === 'instant' ? '15-minute doctor consult' : 'Scheduled appointment'} />
            <SupportNotice title="Selected time" text={bookingType === 'instant' ? 'Within 15 minutes' : selectedSlot || 'Choose a slot'} tone="green" />
            <FormFieldCard>
              <FieldLabel label="Patient name" icon={icons.name} />
              <div className="relative">
                <input className="aid-input pr-14" value={form.patientName} onChange={(event) => setForm((current) => ({ ...current, patientName: event.target.value }))} placeholder="Patient name" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton onResult={(value) => setForm((current) => ({ ...current, patientName: value }))} />
                </div>
              </div>
            </FormFieldCard>
            <FormFieldCard>
              <FieldLabel label="Brief reason for visit" icon={icons.reason} />
              <div className="relative">
                <textarea className="aid-input min-h-28 pr-14" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Brief reason for visit" />
                <div className="absolute right-2 top-2">
                  <VoiceInputButton onResult={(value) => setForm((current) => ({ ...current, reason: value }))} />
                </div>
              </div>
            </FormFieldCard>
            <div className="flex gap-3">
              <button type="button" onClick={() => setBookingType('scheduled')} className={`w-full rounded-lg px-4 py-3 font-semibold ${bookingType === 'scheduled' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'}`}>Scheduled</button>
              <button type="button" onClick={() => setBookingType('instant')} className={`w-full rounded-lg px-4 py-3 font-semibold ${bookingType === 'instant' ? 'bg-red-500 text-white' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'}`}>15 Min Consult</button>
            </div>
            <button type="button" onClick={confirmBooking} className="aid-btn-primary w-full">Confirm Booking</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default DoctorProfilePage;
