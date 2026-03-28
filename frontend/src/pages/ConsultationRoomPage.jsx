import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { getAppointments } from '../utils/appointments';

const fallbackPatients = ['Riya Sharma', 'Aman Patel', 'Neha Verma', 'Sahil Khan', 'Priya Nair'];

function parseAppointmentDate(dateText) {
  if (!dateText || typeof dateText !== 'string') return null;
  const now = new Date();
  const timeMatch = dateText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const hour12 = Number(timeMatch?.[1] || 0);
  const minute = Number(timeMatch?.[2] || 0);
  const ampm = String(timeMatch?.[3] || '').toUpperCase();
  let hour = hour12 % 12;
  if (ampm === 'PM') hour += 12;

  if (dateText.toLowerCase().includes('today')) return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (dateText.toLowerCase().includes('tomorrow')) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, 0, 0);

  const compactMatch = dateText.match(/(\d{1,2})\s*([A-Za-z]{3,9})/);
  if (compactMatch) {
    const day = Number(compactMatch[1]);
    const monthName = compactMatch[2].slice(0, 3).toLowerCase();
    const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const month = monthMap[monthName];
    if (Number.isInteger(month)) return new Date(now.getFullYear(), month, day, hour, minute, 0, 0);
  }

  return null;
}

function sameDate(date, selectedIso) {
  if (!date || !selectedIso) return false;
  const selected = new Date(selectedIso);
  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate()
  );
}

function ConsultationRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'doctor', text: 'Please describe how you have been feeling since yesterday.' },
    { role: 'patient', text: 'I have had a cough and slight chest tightness.' },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeConsultationId, setActiveConsultationId] = useState(id || null);

  const allAppointments = useMemo(() => getAppointments(), []);
  const isDoctor = user?.role === 'doctor';

  const doctorPatientList = useMemo(() => {
    const doctorName = String(user?.name || '').toLowerCase();
    const scoped = allAppointments.filter((appointment) => {
      if (!doctorName) return true;
      return String(appointment.doctor || '').toLowerCase().includes(doctorName);
    });
    const source = scoped.length ? scoped : allAppointments;

    return source
      .map((appointment, index) => {
        const parsedDate = parseAppointmentDate(appointment.date);
        return {
          ...appointment,
          patientName: appointment.patientName || fallbackPatients[index % fallbackPatients.length],
          patientPhoto: appointment.patientPhoto || '',
          appointmentType: appointment.appointmentType || 'Online',
          parsedDate,
          timestamp: parsedDate ? parsedDate.getTime() : Number.MAX_SAFE_INTEGER - index,
        };
      })
      .filter((appointment) => appointment.parsedDate && sameDate(appointment.parsedDate, selectedDate))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [allAppointments, selectedDate, user?.name]);

  const appointment = useMemo(() => {
    if (isDoctor) {
      return doctorPatientList.find((item) => item.consultationId === activeConsultationId) || null;
    }
    return allAppointments.find((item) => item.consultationId === id) || null;
  }, [activeConsultationId, allAppointments, doctorPatientList, id, isDoctor]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((current) => [...current, { role: 'patient', text: chatInput.trim() }]);
    setChatInput('');
  };

  const showConsultationWindow = !isDoctor || Boolean(activeConsultationId);

  return (
    <AppShell>
      <PageHeader
        title="Consultation Room"
        description={
          isDoctor
            ? 'Select a patient from the appointment list to open consultation chat and video.'
            : appointment
              ? `Connected with ${appointment.doctor} for ${appointment.mode === 'instant' ? 'a 15-minute consult' : 'your scheduled consultation'}.`
              : 'Secure video consultation space with notes, patient summary, and live chat.'
        }
        breadcrumb="Dashboard / Consultation Room"
        illustration={<svg viewBox="0 0 220 180" className="w-56 text-blue-600"><rect x="28" y="32" width="132" height="96" rx="20" fill="#DBEAFE" /><rect x="46" y="48" width="96" height="64" rx="14" fill="white" /><path d="M162 62L194 46V114L162 98V62Z" fill="#F87171" opacity="0.8" /></svg>}
      />

      {isDoctor ? (
        <div className="aid-card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold">Patient List</h3>
            <input
              type="date"
              className="aid-input w-auto min-w-52"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setActiveConsultationId(null);
              }}
            />
          </div>
          <div className="mt-4 space-y-3">
            {doctorPatientList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveConsultationId(item.consultationId)}
                className="w-full rounded-2xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.patientPhoto ? (
                      <img src={item.patientPhoto} alt={item.patientName} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                        {item.patientName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{item.patientName}</p>
                      <p className="text-sm text-gray-500">{item.parsedDate?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">{item.appointmentType}</span>
                </div>
              </button>
            ))}
            {doctorPatientList.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900">
                No patient appointments found for this date.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showConsultationWindow ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="aid-card min-h-[420px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {isDoctor ? appointment?.patientName || 'Patient connected' : appointment?.doctor || 'Doctor connected'}
                </p>
                <p className="text-sm text-gray-500">{appointment?.date || 'Live now'}</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-200">Live</span>
            </div>
            <div className="flex h-[340px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <svg viewBox="0 0 260 180" className="w-72 text-blue-600">
                <rect x="34" y="34" width="160" height="112" rx="20" fill="#DBEAFE" />
                <rect x="58" y="54" width="112" height="72" rx="14" fill="white" />
                <path d="M194 76L226 60V120L194 104V76Z" fill="currentColor" opacity="0.7" />
              </svg>
            </div>
          </div>
          <div className="aid-card">
            <h3 className="text-xl font-bold">Consultation Chat</h3>
            <div className="mt-6 space-y-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-2xl p-3 text-sm ${message.role === 'doctor' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-600 text-white'}`}>
                  {message.role === 'doctor' ? 'Doctor' : 'Patient'}: {message.text}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <input
                className="aid-input"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage();
                }}
                placeholder="Type message..."
              />
              <button type="button" onClick={sendMessage} className="aid-btn-primary px-4">Send</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="aid-card text-sm text-gray-600 dark:text-gray-300">
          Select a patient from the list above to start consultation.
        </div>
      )}
    </AppShell>
  );
}

export default ConsultationRoomPage;
