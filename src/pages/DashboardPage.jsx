import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import SupportNotice from '../components/ui/SupportNotice';
import Toast from '../components/ui/Toast';
import ChemistDashboard from '../components/chemist/ChemistDashboard';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useConnectivity } from '../hooks/useConnectivity';
import { getAppointments } from '../utils/appointments';
import { mockDoctors } from '../utils/mockData';
import { getDoctorContacts, saveDoctorContacts } from '../utils/offlineStore';
import { apiRequest } from '../utils/api';

const fallbackPatients = ['Riya Sharma', 'Aman Patel', 'Neha Verma', 'Sahil Khan', 'Priya Nair'];

function resolvePatientName(appointment, index) {
  const rawName = String(appointment.patientName || '').trim();
  const doctorName = String(appointment.doctor || '').trim();
  const looksLikeDoctor =
    rawName.toLowerCase().startsWith('dr') ||
    rawName.toLowerCase().includes('doctor') ||
    (doctorName && rawName.toLowerCase() === doctorName.toLowerCase());

  if (!rawName || looksLikeDoctor) {
    return fallbackPatients[index % fallbackPatients.length];
  }

  return rawName;
}

function parseAppointmentDate(dateText) {
  if (!dateText || typeof dateText !== 'string') return null;

  const now = new Date();
  const timeMatch = dateText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const hours12 = Number(timeMatch?.[1] || 0);
  const minutes = Number(timeMatch?.[2] || 0);
  const meridiem = String(timeMatch?.[3] || '').toUpperCase();
  let hours = hours12 % 12;
  if (meridiem === 'PM') hours += 12;

  if (dateText.toLowerCase().includes('today')) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return date;
  }

  if (dateText.toLowerCase().includes('tomorrow')) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0, 0);
    return date;
  }

  const compactMatch = dateText.match(/(\d{1,2})\s*([A-Za-z]{3,9})/);
  if (compactMatch) {
    const day = Number(compactMatch[1]);
    const monthName = compactMatch[2].slice(0, 3).toLowerCase();
    const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const month = monthMap[monthName];
    if (Number.isInteger(month)) {
      return new Date(now.getFullYear(), month, day, hours, minutes, 0, 0);
    }
  }

  return null;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateTime(dateText, parsed) {
  if (parsed) {
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  return dateText || 'Not scheduled';
}

function statusTone(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'confirmed' || normalized === 'ready now') return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200';
  if (normalized === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200';
  if (normalized === 'cancelled') return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200';
}

function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isOnline, queueCriticalNotification } = useConnectivity();
  const [scheduleFilter, setScheduleFilter] = useState('today');
  const [toast, setToast] = useState(null);
  const [offlineDoctors, setOfflineDoctors] = useState([]);
  const allAppointments = useMemo(() => getAppointments(), []);
  const patientAppointments = allAppointments.slice(0, 2);

  useEffect(() => {
    const preferred = user?.preferredDoctorPhone
      ? [{
          phone: user.preferredDoctorPhone,
          name: user.preferredDoctorName || 'Preferred Doctor',
          specialization: 'Primary',
          preferred: true,
        }]
      : [];

    saveDoctorContacts([
      ...preferred,
      ...mockDoctors.map((doctor, index) => ({
        phone: doctor.phone || `98765000${index + 10}`,
        name: doctor.name,
        specialization: doctor.specialization,
        preferred: !preferred.length && index === 0,
      })),
    ]);
    getDoctorContacts().then(setOfflineDoctors);
  }, [user?.preferredDoctorName, user?.preferredDoctorPhone]);

  const doctorAppointments = useMemo(() => {
    const now = new Date();
    const userDoctorName = String(user?.name || '').toLowerCase();
    const scoped = allAppointments.filter((appointment) => {
      if (!userDoctorName) return true;
      return String(appointment.doctor || '').toLowerCase().includes(userDoctorName);
    });
    const appointmentsToUse = scoped.length ? scoped : allAppointments;

    return appointmentsToUse
      .map((appointment, index) => {
        const parsedDate = parseAppointmentDate(appointment.date);
        let bucket = 'upcoming';
        if (String(appointment.status || '').toLowerCase() === 'completed') bucket = 'past';
        else if (parsedDate && parsedDate < now) bucket = 'past';
        else if (parsedDate && isSameDay(parsedDate, now)) bucket = 'today';

        return {
          ...appointment,
          patientName: resolvePatientName(appointment, index),
          patientPhoto: appointment.patientPhoto || '',
          appointmentType: appointment.appointmentType || (appointment.mode === 'instant' ? 'Online' : 'In-person'),
          status: appointment.status || 'Confirmed',
          parsedDate,
          timestamp: parsedDate ? parsedDate.getTime() : Number.MAX_SAFE_INTEGER - index,
          bucket,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [allAppointments, user?.name]);

  const visibleDoctorAppointments = doctorAppointments.filter((appointment) => {
    if (scheduleFilter === 'today') return appointment.bucket === 'today';
    if (scheduleFilter === 'upcoming') return appointment.bucket === 'upcoming';
    return appointment.bucket === 'past';
  });

  if (user?.role === 'doctor') {
    const pendingCount = doctorAppointments.filter((appointment) => String(appointment.status).toLowerCase() === 'pending').length;
    const todayCount = doctorAppointments.filter((appointment) => appointment.bucket === 'today').length;
    const consultationEarnings = doctorAppointments
      .filter((appointment) => String(appointment.paymentStatus || '').toLowerCase() === 'paid')
      .reduce((sum, appointment) => sum + Number(appointment.paymentAmount || 0), 0);

    return (
      <AppShell>
        <PageHeader
          title={t('dashboard.welcomeDoctor', 'Welcome, Dr. {{name}}', { name: user?.name || 'Doctor' })}
          description={t('dashboard.doctorDesc', "See today's work in a simple way.")}
          breadcrumb={t('common.dashboard', 'Dashboard')}
          illustration={<svg viewBox="0 0 260 180" className="w-64 text-blue-600"><rect x="24" y="34" width="212" height="118" rx="24" fill="#DBEAFE" /><rect x="48" y="54" width="164" height="78" rx="18" fill="white" /><path d="M70 96H116L126 80L140 112L154 70L168 96H192" stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="aid-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold">My Schedule</h3>
              <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
                {[
                  ['today', 'Today'],
                  ['upcoming', 'Upcoming'],
                  ['past', 'Past'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScheduleFilter(value)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${scheduleFilter === value ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {visibleDoctorAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {appointment.patientPhoto ? (
                        <img src={appointment.patientPhoto} alt={appointment.patientName} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                          {appointment.patientName
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(appointment.date, appointment.parsedDate)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">{appointment.appointmentType}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(appointment.status)}`}>{appointment.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {visibleDoctorAppointments.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900">
                  No appointments found for this filter.
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-6">
            <SupportNotice title={t('dashboard.pendingRequests', 'Pending requests')} text={`${pendingCount} doctor-relevant request${pendingCount === 1 ? '' : 's'} need review.`} />
            <SupportNotice title="Today's consultations" text={`${todayCount} consultations are lined up for today.`} tone="green" />
            <SupportNotice title={t('dashboard.earningsSummary', 'Earnings summary')} text={`Consultation earnings from patients: Rs. ${consultationEarnings}`} tone="green" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (user?.role === 'chemist') {
    return <AppShell><ChemistDashboard /></AppShell>;
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title={t('dashboard.welcomePatient', 'Welcome, {{name}}', { name: user?.name || 'Patient' })}
        description={t('dashboard.patientDesc', 'Start with one simple action below.')}
        breadcrumb={t('common.dashboard', 'Dashboard')}
        illustration={
          <svg viewBox="0 0 260 180" className="w-64 text-blue-600">
            <rect x="24" y="34" width="212" height="118" rx="24" fill="#DBEAFE" />
            <rect x="48" y="54" width="164" height="78" rx="18" fill="white" />
            <path d="M70 96H116L126 80L140 112L154 70L168 96H192" stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {!isOnline ? (
            <div className="aid-card border-2 border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <h3 className="text-xl font-bold text-red-700 dark:text-red-200">Emergency: Call Doctor (Offline)</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-200">Internet is unavailable. You can still call your doctor directly.</p>
              {offlineDoctors[0]?.phone ? (
                <a href={`tel:${offlineDoctors[0].phone}`} className="aid-btn-accent mt-4 inline-flex w-full items-center justify-center">
                  Call Preferred Doctor • {offlineDoctors[0].name}
                </a>
              ) : null}
              <button
                type="button"
                className="aid-btn-primary mt-3 w-full"
                onClick={async () => {
                  try {
                    const payload = {
                      patientName: user?.name || 'Patient',
                      doctorPhone: offlineDoctors[0]?.phone || '',
                      patientPhone: user?.phone || '',
                    };
                    await apiRequest('/api/communication/emergency-sms', {
                      method: 'POST',
                      body: JSON.stringify(payload),
                    });
                    if (!isOnline) {
                      queueCriticalNotification({
                        type: 'emergency',
                        message: `EMERGENCY: ${payload.patientName} needs urgent help.`,
                        to: payload.doctorPhone,
                      });
                    }
                    setToast({ type: 'success', title: 'Emergency SMS queued', message: 'Doctor will be notified by SMS as fallback.' });
                  } catch (error) {
                    setToast({ type: 'error', title: 'SMS failed', message: error.message });
                  }
                }}
              >
                Send Emergency SMS
              </button>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Saved doctor contacts</p>
                {offlineDoctors.map((doctor) => (
                  <div key={doctor.phone} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm dark:bg-gray-900">
                    <div>
                      <p className="font-semibold">{doctor.name}</p>
                      <p className="text-gray-500">{doctor.specialization}</p>
                    </div>
                    <a href={`tel:${doctor.phone}`} className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white">
                      Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="aid-card">
            <h3 className="text-2xl font-bold">{t('dashboard.whatNeedToday', 'What do you need today?')}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link to="/doctors" className="rounded-3xl bg-blue-600 p-5 text-white transition hover:bg-blue-700">
                <p className="text-lg font-bold">{t('common.bookDoctor', 'Book a doctor')}</p>
                <p className="mt-2 text-sm text-blue-100">{t('dashboard.bookDoctorText', 'Choose a doctor and book a consultation.')}</p>
              </Link>
              <Link to="/symptom-checker" className="rounded-3xl bg-white p-5 text-gray-900 ring-1 ring-gray-200 transition hover:ring-blue-300 dark:bg-gray-900 dark:text-white dark:ring-gray-700">
                <p className="text-lg font-bold">{t('common.checkSymptoms', 'Check symptoms')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('dashboard.checkSymptomsText', 'Answer simple questions and get guidance.')}</p>
              </Link>
              <Link to="/appointments" className="rounded-3xl bg-white p-5 text-gray-900 ring-1 ring-gray-200 transition hover:ring-blue-300 dark:bg-gray-900 dark:text-white dark:ring-gray-700">
                <p className="text-lg font-bold">{t('common.myAppointments', 'My appointments')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('dashboard.myAppointmentsText', 'Pay, join, or check past visits.')}</p>
              </Link>
              <Link to="/medicine-store" className="rounded-3xl bg-white p-5 text-gray-900 ring-1 ring-gray-200 transition hover:ring-blue-300 dark:bg-gray-900 dark:text-white dark:ring-gray-700">
                <p className="text-lg font-bold">{t('common.buyMedicines', 'Buy medicines')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('dashboard.buyMedicinesText', 'Order medicines with home delivery or pickup.')}</p>
              </Link>
              <Link to="/emergency" className="rounded-3xl bg-red-500 p-5 text-white transition hover:bg-red-600">
                <p className="text-lg font-bold">{t('common.emergencyHelp', 'Emergency help')}</p>
                <p className="mt-2 text-sm text-red-100">{t('dashboard.emergencyHelpText', 'Open SOS for urgent medical support.')}</p>
              </Link>
            </div>
          </div>

          <div className="aid-card">
            <h3 className="text-xl font-bold">{t('dashboard.nextAppointment', 'Your next appointment')}</h3>
            <div className="mt-4 space-y-3">
              {patientAppointments.length ? (
                patientAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="font-semibold">{appointment.doctor}</p>
                    <p className="mt-1 text-sm text-gray-500">{appointment.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t('dashboard.noAppointmentYet', 'No appointment yet. Use "Book a doctor" to get started.')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SupportNotice title={t('dashboard.needFastHelp', 'Need fast help?')} text={t('dashboard.needFastHelpText', 'Use the 15-minute consultation option from any doctor profile for quicker medical guidance.')} tone="green" />
          <SupportNotice title={t('dashboard.needLocalLanguage', 'Need help in local language?')} text={t('dashboard.needLocalLanguageText', 'Change your language from the top menu and choose doctors who speak your language.')} />
          <SupportNotice title={t('dashboard.healthReminder', 'Health reminder')} text={t('dashboard.healthReminderText', 'If chest pain, severe bleeding, or breathing trouble starts suddenly, use SOS immediately.')} tone="amber" />
        </div>
      </div>
    </AppShell>
  );
}

export default DashboardPage;
