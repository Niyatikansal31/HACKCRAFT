import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { useLanguage } from '../../hooks/useLanguage';

function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout title={t('auth.resetPassword', 'Reset Password')} subtitle={t('auth.recoverAccess', 'Recover your access in three guided steps.')}>
      <div className="mb-8 flex items-center justify-between gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-1 items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${step >= item ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
              {item}
            </div>
            {item < 3 ? <div className={`h-1 flex-1 rounded-full ${step > item ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} /> : null}
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
          <div className="min-w-full space-y-4">
            <label className="block font-medium">Email</label>
            <input className="aid-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <button type="button" onClick={() => setStep(2)} className="aid-btn-primary w-full">
              Continue to OTP
            </button>
          </div>
          <div className="min-w-full space-y-4">
            <label className="block font-medium">OTP</label>
            <input className="aid-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
            <button type="button" onClick={() => setStep(3)} className="aid-btn-primary w-full">
              Verify OTP
            </button>
          </div>
          <div className="min-w-full space-y-4">
            <label className="block font-medium">New Password</label>
            <PasswordInput name="newPassword" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a new password" />
            <button type="button" className="aid-btn-primary w-full">
              Save New Password
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm font-semibold text-blue-600">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
