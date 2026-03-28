import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import OTPInput from '../../components/auth/OTPInput';
import Toast from '../../components/ui/Toast';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(60);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const phone = location.state?.phone || '';
  const role = location.state?.role || 'patient';
  const maskedPhone = phone ? `+91 XXXXXX${phone.slice(-4)}` : '+91 XXXXXX1234';

  useEffect(() => {
    if (counter <= 0) return undefined;
    const timer = setTimeout(() => setCounter((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, role }),
      });
      login(data.token, { ...data.user, role });
      navigate('/dashboard');
    } catch (error) {
      setToast({ type: 'error', title: 'Verification failed', message: error.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
    setCounter(60);
  };

  return (
    <AuthLayout title={t('auth.verifyYourPhone', 'Verify Your Phone')} subtitle={`We sent a 6-digit OTP to ${maskedPhone}`}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="mb-8 flex justify-center">
        <svg viewBox="0 0 220 180" className="w-60">
          <rect x="58" y="14" width="104" height="152" rx="22" fill="#DBEAFE" />
          <rect x="70" y="28" width="80" height="118" rx="14" fill="white" />
          <path d="M98 78H122" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" />
          <path d="M110 66V90" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" />
          <path d="M155 43L182 70V116C182 133 168 147 151 147C134 147 120 133 120 116V86C120 69 134 55 151 55C157 55 163 57 168 61" stroke="#F87171" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <OTPInput value={otp} onChange={setOtp} />
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        {t('auth.otpDemo', 'Demo OTP: 123456')}
      </div>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        {counter > 0 ? `${t('auth.resendOtpIn', 'Resend OTP in')} 00:${String(counter).padStart(2, '0')}` : <button type="button" onClick={resendOtp} className="font-semibold text-blue-600">{t('auth.resendOtp', 'Resend OTP')}</button>}
      </div>
      <button type="button" onClick={verifyOtp} disabled={loading || otp.length !== 6} className="aid-btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? t('common.pleaseWait', 'Please wait...') : t('auth.verify', 'Verify')}
      </button>
    </AuthLayout>
  );
}

export default OTPVerificationPage;
