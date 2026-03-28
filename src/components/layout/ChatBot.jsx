import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import SpeakerButton from '../ui/SpeakerButton';
import { useLanguage } from '../../hooks/useLanguage';

const emergencyKeywords = ['chest pain', "can't breathe", 'unconscious', 'seizure', 'stroke', 'heart attack', 'bleeding', 'overdose', 'saans nahi', 'behosh', 'ambulance', 'dying', 'help me', 'emergency'];

function getBotResponse(message) {
  const text = message.toLowerCase();

  if (text.includes('15 min') || text.includes('15-minute') || text.includes('urgent consult') || text.includes('fast consult')) {
    return {
      text: 'You can use the 15-minute doctor consultation option on a doctor profile. Book it, complete payment, and the consultation unlocks right away in My Appointments.',
      actions: [{ label: 'Find Doctors', path: '/doctors' }],
    };
  }

  if (text.includes('appointment') || text.includes('book doctor') || text.includes('doctor consult')) {
    return {
      text: 'To book a consultation, open a doctor profile, choose either Scheduled or 15 Min Consult, confirm the booking, and then pay from My Appointments.',
      actions: [{ label: 'Open Doctors', path: '/doctors' }, { label: 'My Appointments', path: '/appointments' }],
    };
  }

  if (text.includes('payment') || text.includes('pay now') || text.includes('invoice')) {
    return {
      text: 'Payments are handled after booking. Open My Appointments, tap Pay Now on the appointment card, and your consultation room will unlock.',
      actions: [{ label: 'Open Appointments', path: '/appointments' }, { label: 'Payments', path: '/payments' }],
    };
  }

  if (text.includes('join') || text.includes('consultation room') || text.includes('video call')) {
    return {
      text: 'After payment, your appointment card shows a Join Consultation button. That opens the live consultation room for the booked session.',
      actions: [{ label: 'Go to Appointments', path: '/appointments' }],
    };
  }

  if (text.includes('symptom')) {
    return {
      text: 'The symptom checker now guides you in 3 steps and updates the triage panel based on symptom, duration, and severity.',
      actions: [{ label: 'Open Symptom Checker', path: '/symptom-checker' }],
    };
  }

  return {
    text: 'I can help you book a doctor, make a payment, join a consultation, use the 15-minute consult flow, or open emergency support.',
    actions: [
      { label: 'Find Doctors', path: '/doctors' },
      { label: 'Appointments', path: '/appointments' },
    ],
  };
}

function ChatBot({ onOpenEmergency }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyPrompt, setEmergencyPrompt] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: t('chatbot.greeting', 'Hi, I am AID AI. I can help with doctor booking, payments, joining consultations, 15-minute consults, and emergency guidance.'),
    },
  ]);

  const quickActions = useMemo(
    () => [
      { label: t('chatbot.bookDoctor', 'Book Doctor'), path: '/doctors' },
      { label: t('common.myAppointments', 'My Appointments'), path: '/appointments' },
      { label: t('chatbot.payments', 'Payments'), path: '/payments' },
    ],
    [t],
  );

  const handleSend = async () => {
    if (!message.trim()) return;

    const nextMessage = message.trim();
    setMessages((current) => [...current, { role: 'user', text: nextMessage }]);
    setMessage('');

    const normalized = nextMessage.toLowerCase();
    if (emergencyKeywords.some((keyword) => normalized.includes(keyword))) {
      setEmergencyPrompt(true);
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));
      const response = getBotResponse(nextMessage);
      setMessages((current) => [...current, { role: 'assistant', text: response.text, actions: response.actions }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-[90] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl"
      >
        <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="10" width="28" height="24" rx="12" fill="white" opacity="0.15" />
          <rect x="11" y="11" width="26" height="22" rx="11" stroke="white" strokeWidth="2" />
          <circle cx="19" cy="22" r="2" fill="white" />
          <circle cx="29" cy="22" r="2" fill="white" />
          <path d="M18 28C20 30 28 30 30 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 10V6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`fixed right-0 top-0 z-[95] h-full w-full max-w-[360px] transform border-l border-gray-200 bg-white shadow-2xl transition-transform dark:border-gray-800 dark:bg-gray-950 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-semibold">{t('chatbot.title', 'AID AI Assistant')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('chatbot.subtitle', 'Guidance for booking, payments, consults, and urgent care')}</p>
            </div>
            <SpeakerButton text={t('chatbot.subtitle', 'Guidance for booking, payments, consults, and urgent care')} className="h-8 w-8" />
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-2xl">
            ×
          </button>
        </div>

        <div className="flex h-[calc(100%-9rem)] flex-col">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button key={action.label} type="button" onClick={() => navigate(action.path)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {emergencyPrompt ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{t('chatbot.emergencyWarning', 'This sounds like an emergency. Do you need immediate help?')}</p>
                  <SpeakerButton text={t('chatbot.emergencyWarning', 'This sounds like an emergency. Do you need immediate help?')} className="h-8 w-8" />
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={onOpenEmergency} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                    {t('chatbot.openEmergencyPanel', 'Open Emergency Panel')}
                  </button>
                  <button type="button" onClick={() => setEmergencyPrompt(false)} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold">
                    {t('chatbot.continueChat', "I'm OK, continue chatting")}
                  </button>
                </div>
              </div>
            ) : null}

            {messages.map((chat, index) => (
              <div key={`${chat.role}-${index}`} className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${chat.role === 'assistant' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : 'ml-auto bg-blue-600 text-white'}`}>
                <div className="flex items-start gap-2">
                  <p>{chat.text}</p>
                  <SpeakerButton text={chat.text} className={`h-8 w-8 ${chat.role === 'assistant' ? '' : 'text-white'}`} />
                </div>
                {chat.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chat.actions.map((action) => (
                      <button
                        key={`${action.label}-${action.path}`}
                        type="button"
                        onClick={() => navigate(action.path)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${chat.role === 'assistant' ? 'bg-white text-blue-700 dark:bg-gray-900 dark:text-blue-200' : 'bg-white/20 text-white'}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? <Spinner label="Thinking..." /> : null}
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <label className="sr-only" htmlFor="chatbot-message">{t('chatbot.placeholder', 'Ask about booking, payment, 15-min consult...')}</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  id="chatbot-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  placeholder={t('chatbot.placeholder', 'Ask about booking, payment, 15-min consult...')}
                  className="aid-input"
                />
              </div>
              <button type="button" onClick={handleSend} className="aid-btn-primary px-4">
                {t('chatbot.send', 'Send')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatBot;
