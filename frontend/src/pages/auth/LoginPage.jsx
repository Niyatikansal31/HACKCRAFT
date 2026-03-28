import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import RoleSelectionCard from '../../components/layout/RoleSelectionCard';
import Toast from '../../components/ui/Toast';
import FieldLabel from '../../components/ui/FieldLabel';
import FormFieldCard from '../../components/ui/FormFieldCard';
import { roleOptions } from '../../utils/constants';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

const icons = {
  phone: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M8 4H5C4.4 4 4 4.4 4 5V8C4 14.6 9.4 20 16 20H19C19.6 20 20 19.6 20 19V16L15.5 14L13 16.5C10.8 15.4 8.6 13.2 7.5 11L10 8.5L8 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  email: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 7H20V17H4V7Z" stroke="currentColor" strokeWidth="1.8" /><path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  password: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke="currentColor" strokeWidth="1.8" /></svg>,
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState('patient');
  const [tab, setTab] = useState('otp');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const sendOtp = async () => {
    try {
      setLoading(true);
      await apiRequest('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, role }),
      });
      navigate('/verify-otp', { state: { phone, role } });
    } catch (error) {
      setToast({ type: 'error', title: t('auth.unableToSendOtp', 'Unable to send OTP'), message: error.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      login(data.token, { ...data.user, role });
      navigate('/dashboard');
    } catch (error) {
      setToast({ type: 'error', title: t('auth.loginFailed', 'Login failed'), message: error.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    login('guest-token', { name: 'Guest User', role: 'patient', isGuest: true });
    navigate('/dashboard');
  };

  return (
    <AuthLayout title={t('auth.welcomeBack', 'Welcome Back')} subtitle={t('auth.chooseRoleLogin', 'Pick your role and sign in with OTP or password.')}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="grid gap-4 md:grid-cols-3">
        {roleOptions.map((option) => (
          <RoleSelectionCard
            key={option.id}
            role={option}
            selected={role === option.id}
            onSelect={setRole}
            illustration={
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-200">
                <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M12 38C14 29 34 29 36 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            }
          />
        ))}
      </div>

      <div className="mt-8">
        <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          <button type="button" onClick={() => setTab('otp')} className={`rounded-2xl px-5 py-3 font-semibold ${tab === 'otp' ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>
            {t('auth.loginWithOtp', 'Login with OTP')}
          </button>
          <button type="button" onClick={() => setTab('password')} className={`rounded-2xl px-5 py-3 font-semibold ${tab === 'password' ? 'bg-white text-blue-600 shadow dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>
            {t('auth.loginWithPassword', 'Login with Password')}
          </button>
        </div>

        {tab === 'otp' ? (
          <div className="mt-6 space-y-4">
            <FormFieldCard>
              <FieldLabel label={t('auth.phoneNumber', 'Phone Number')} icon={icons.phone} />
              <div className="flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <span className="flex items-center border-r border-gray-200 px-3 text-gray-500 dark:border-gray-700">+91</span>
                <input className="w-full rounded-r-lg bg-transparent p-3 outline-none" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" />
              </div>
            </FormFieldCard>
            <button type="button" onClick={sendOtp} disabled={loading || phone.length !== 10} className="aid-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? t('common.pleaseWait', 'Please wait...') : t('auth.sendOtp', 'Send OTP')}
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <FormFieldCard>
              <FieldLabel label={t('common.email', 'Email')} icon={icons.email} />
              <input className="aid-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </FormFieldCard>
            <FormFieldCard>
              <FieldLabel label={t('common.password', 'Password')} icon={icons.password} />
              <PasswordInput name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.enterPassword', 'Enter your password')} />
            </FormFieldCard>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-blue-600">
                {t('auth.forgotPassword', 'Forgot Password?')}
              </Link>
            </div>
            <button type="submit" disabled={loading} className="aid-btn-primary w-full">
              {loading ? t('common.pleaseWait', 'Please wait...') : t('common.login', 'Login')}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 space-y-3 text-center text-sm text-gray-600 dark:text-gray-300">
        <p>
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link to="/signup" className="font-semibold text-blue-600">
            {t('auth.registerHere', 'Register here')}
          </Link>
        </p>
        <button type="button" onClick={continueAsGuest} className="font-semibold text-gray-700 underline dark:text-gray-200">
          {t('auth.continueAsGuest', 'Continue as Guest')}
        </button>
      </div>

      <button type="button" disabled title="Coming Soon" className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 px-5 py-4 text-gray-400 dark:border-gray-700">
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21.8 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.5c-.2 1.4-1 2.7-2.2 3.5v2.9h3.6c2.1-2 3.3-4.9 3.3-8.5Z" />
          <path fill="currentColor" d="M12 22c2.9 0 5.3-1 7.1-2.7l-3.6-2.9c-1 .7-2.2 1.2-3.5 1.2-2.7 0-5-1.8-5.8-4.3H2.5v2.9A10 10 0 0 0 12 22Z" />
          <path fill="currentColor" d="M6.2 13.3A6 6 0 0 1 6 12c0-.4.1-.9.2-1.3V7.8H2.5A10 10 0 0 0 2 12c0 1.6.4 3 1 4.2l3.2-2.9Z" />
          <path fill="currentColor" d="M12 6.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1A10 10 0 0 0 2.5 7.8l3.7 2.9c.8-2.5 3.1-4.3 5.8-4.3Z" />
        </svg>
        {t('auth.googleComingSoon', 'Google Login Coming Soon')}
      </button>
    </AuthLayout>
  );
}

export default LoginPage;
